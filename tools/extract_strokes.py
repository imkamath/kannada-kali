"""Derive approximate stroke paths for Kannada letters from a font's glyph shapes.

Render glyph -> skeletonize -> split skeleton graph into edges -> join edges into
continuous strokes (top-left first, smoothest turn at junctions) -> simplify.
Output: strokes.json  {letter: [[[x,y],...], ...]} in a 0..100 box.
"""
import json, math, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from skimage.morphology import skeletonize, remove_small_holes, remove_small_objects

FONT = sys.argv[1]
OUT = sys.argv[2]
LETTERS = "ಅ ಆ ಇ ಈ ಉ ಊ ಋ ಎ ಏ ಐ ಒ ಓ ಔ ಕ ಖ ಗ ಘ ಙ ಚ ಛ ಜ ಝ ಞ ಟ ಠ ಡ ಢ ಣ ತ ಥ ದ ಧ ನ ಪ ಫ ಬ ಭ ಮ ಯ ರ ಲ ವ ಶ ಷ ಸ ಹ ಳ".split()
N = 400

def render(ch):
    f = ImageFont.truetype(FONT, 300)
    im = Image.new('L', (N * 2, N * 2), 0)
    d = ImageDraw.Draw(im)
    d.text((N * 0.4, N * 0.2), ch, font=f, fill=255)
    a = np.array(im) > 128
    ys, xs = np.nonzero(a)
    a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    return a

def neighbors(p, S):
    y, x = p
    out = []
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dy == 0 and dx == 0:
                continue
            q = (y + dy, x + dx)
            if q in S:
                out.append(q)
    return out

def skeleton_edges(a):
    a = remove_small_holes(a, 30)
    sk = skeletonize(a)
    sk = remove_small_objects(sk, 8, connectivity=2)
    S = set(zip(*np.nonzero(sk)))
    deg = {p: len(neighbors(p, S)) for p in S}
    nodes = {p for p in S if deg[p] != 2}
    # merge adjacent junction pixels into clusters
    visited_e = set()
    edges = []
    def walk(start, nxt):
        path = [start, nxt]
        prev, cur = start, nxt
        while cur not in nodes:
            nb = [q for q in neighbors(cur, S) if q != prev and (cur, q) not in visited_e]
            # prefer 4-neighbours to avoid diagonal shortcuts
            nb.sort(key=lambda q: abs(q[0] - cur[0]) + abs(q[1] - cur[1]))
            nb = [q for q in nb if q not in path[-3:]]
            if not nb:
                break
            prev, cur = cur, nb[0]
            path.append(cur)
            if cur == start:
                break
        return path
    for n in nodes:
        for q in neighbors(n, S):
            if (n, q) in visited_e:
                continue
            p = walk(n, q)
            for i in range(len(p) - 1):
                visited_e.add((p[i], p[i + 1]))
                visited_e.add((p[i + 1], p[i]))
            edges.append(p)
    # pure loops with no nodes
    rest = S - {p for e in edges for p in e}
    while rest:
        s = min(rest)
        nb = neighbors(s, S)
        if not nb:
            rest.discard(s)
            continue
        p = walk(s, nb[0])
        edges.append(p)
        rest -= set(p)
    return edges, a.shape

def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy) or 1e-9
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        x0, y0 = pts[i]
        d = abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / L if math.hypot(dx, dy) > 1e-9 else math.hypot(x0 - x1, y0 - y1)
        if d > dmax:
            dmax, idx = d, i
    if dmax > eps:
        return rdp(pts[:idx + 1], eps)[:-1] + rdp(pts[idx:], eps)
    return [pts[0], pts[-1]]

def plen(p):
    return sum(math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]) for i in range(len(p) - 1))

NO_TALE = set('ಅಆಇಈಉಊಋಎಏಐಒಓಔಙಞಣಬಯಲಳ')
def build(ch):
    global HAS_TALE
    HAS_TALE = ch not in NO_TALE
    a = render(ch)
    edges, (h, w) = skeleton_edges(a)
    s = 84 / max(h, w)
    ox, oy = (100 - w * s) / 2, (100 - h * s) / 2
    E = [[(x * s + ox, y * s + oy) for (y, x) in e] for e in edges]
    # drop tiny spurs (dangling short edges)
    def is_end(pt, E):
        c = sum(1 for e in E for q in (e[0], e[-1]) if math.hypot(q[0] - pt[0], q[1] - pt[1]) < 2.5)
        return c <= 1
    changed = True
    while changed:
        changed = False
        for e in list(E):
            if plen(e) < 6 and (is_end(e[0], E) or is_end(e[-1], E)) and len(E) > 1:
                E.remove(e)
                changed = True
    # join edges into strokes
    def close(p, q):
        return math.hypot(p[0] - q[0], p[1] - q[1]) < 3.0
    def endpoint_degree(pt, idxs):
        return sum(1 for i in idxs for q in (E[i][0], E[i][-1]) if close(q, pt))
    def dir_out(e, k=6):
        j = min(len(e) - 1, k)
        return (e[j][0] - e[0][0], e[j][1] - e[0][1])
    def dir_in(path, k=6):
        j = max(0, len(path) - 1 - k)
        return (path[-1][0] - path[j][0], path[-1][1] - path[j][1])
    def cosang(a, b):
        na, nb = math.hypot(*a) or 1, math.hypot(*b) or 1
        return (a[0] * b[0] + a[1] * b[1]) / (na * nb)
    def extend(cur, unused, allow=lambda e: True, min_cos=-0.35):
        while True:
            end = cur[-1]
            best = None
            for j in list(unused):
                for rv in (False, True):
                    e = E[j][::-1] if rv else E[j]
                    if close(e[0], end) and allow(e):
                        c = cosang(dir_in(cur), dir_out(e))
                        if best is None or c > best[0]:
                            best = (c, j, e)
            if best is None or best[0] < min_cos:
                return cur
            unused.remove(best[1])
            cur = cur + best[2][1:]
    unused = list(range(len(E)))
    tale = None
    # talekattu: free end at the top right (the tick), traced back along the high edges
    tips = []
    for i in unused:
        for rv in (False, True):
            pt = E[i][-1] if rv else E[i][0]
            if pt[1] < 32 and pt[0] > 50 and plen(E[i]) > 6:
                tips.append((pt[0] - pt[1] * 1.5, i, rv))
    if tips and HAS_TALE:
        tips.sort(reverse=True)
        _, i, rv = tips[0]
        e = E[i][::-1] if not rv else E[i][:]   # start AT the tip
        if e[0][1] > e[-1][1]:
            e = e[::-1]
        if not (math.hypot(e[0][0]-tips[0][0] if False else 0, 0) and False):
            pass
        cur = E[i][::-1] if rv else E[i][:]
        unused.remove(i)
        cur = extend(cur, unused, allow=lambda e: max(p[1] for p in e) < 40, min_cos=-0.2)
        if plen(cur) > 10:
            tale = cur[::-1]
        else:
            unused.append(i)
    strokes = []
    while unused:
        cands = []
        for i in unused:
            for rev in (False, True):
                st = E[i][-1] if rev else E[i][0]
                free = endpoint_degree(st, unused) == 1
                cands.append((0 if free else 1, st[0] + st[1] * 0.3, i, rev))
        cands.sort()
        _, _, i, rev = cands[0]
        cur = E[i][::-1] if rev else E[i][:]
        unused.remove(i)
        strokes.append(extend(cur, unused))
    strokes.sort(key=lambda st: -plen(st))
    body, marks = strokes[:1], strokes[1:]
    marks.sort(key=lambda st: (st[0][0] * 0.6 + st[0][1]))
    def trim_hook(p):
        # end the tick at its highest point (drops the little curl the skeleton leaves at the tip)
        tail = max(1, len(p) // 6)
        k = min(range(len(p) - tail, len(p)), key=lambda i: p[i][1])
        return p[:k + 1]
    if tale is not None:
        if tale[0][1] < tale[-1][1]:
            tale = tale[::-1]
        tale = trim_hook(tale)
    # If the head bar was swallowed by a body stroke (it starts at the bar's left end and runs
    # right along the top), move that bar into the talekattu so the body starts below it.
    if tale is not None:
        for k, st in enumerate(body + marks):
            if len(st) > 2 and st[0][1] < 42 and abs(st[1][1] - st[0][1]) < 5 and st[1][0] > st[0][0] + 8:
                j = 0
                while j < len(st) - 1 and st[j + 1][1] < 42 and abs(st[j + 1][1] - st[j][1]) < 5 and st[j + 1][0] >= st[j][0] - 1:
                    j += 1
                bar, rest = st[:j + 1], st[j:]
                if plen(bar) > 12 and plen(rest) > 10 and math.hypot(bar[-1][0] - tale[0][0], bar[-1][1] - tale[0][1]) < 10:
                    tale = bar + tale[1:]
                    if k < len(body):
                        body[k] = rest
                    else:
                        marks[k - len(body)] = rest
                break
    # write left to right: a stroke whose two ends sit at a similar height starts at its left end
    fixed = []
    for st in body + marks:
        if abs(st[0][1] - st[-1][1]) < 12 and st[0][0] > st[-1][0] + 8 and not close(st[0], st[-1]):
            st = st[::-1]
        fixed.append(st)
    strokes = fixed + ([tale] if tale else [])
    out = []
    for st in strokes:
        if plen(st) < 7:
            continue
        simp = rdp(st, 0.9)
        out.append([[round(x, 1), round(y, 1)] for x, y in simp])
    return out

res = {}
for ch in LETTERS:
    try:
        res[ch] = build(ch)
    except Exception as ex:
        print('fail', ch, ex)
json.dump(res, open(OUT, 'w'), ensure_ascii=False)
print({k: len(v) for k, v in res.items()})
