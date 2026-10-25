"""Draw a review sheet: each letter's strokes, numbered, with start dots and colours by order."""
import json, sys
from PIL import Image, ImageDraw, ImageFont
data = json.load(open(sys.argv[1]))
out = sys.argv[2]
only = sys.argv[3].split(',') if len(sys.argv) > 3 else list(data.keys())
COLS = 8
S = 180
cols = ['#D6246E', '#2563EB', '#0E9F8E', '#F59E0B', '#5B2EBF', '#F97352', '#16A34A']
rows = (len(only) + COLS - 1) // COLS
im = Image.new('RGB', (COLS * S, rows * S), 'white')
d = ImageDraw.Draw(im)
fnt = ImageFont.load_default()
kn = ImageFont.truetype('/root/.fonts/NotoKn400.ttf', 22)
for idx, ch in enumerate(only):
    ox, oy = (idx % COLS) * S, (idx // COLS) * S
    d.rectangle([ox + 2, oy + 2, ox + S - 2, oy + S - 2], outline='#DDD')
    d.text((ox + 6, oy + 2), ch, font=kn, fill='black')
    sc = (S - 20) / 100
    for si, st in enumerate(data.get(ch, [])):
        pts = [(ox + 10 + x * sc, oy + 14 + y * sc) for x, y in st]
        c = cols[si % len(cols)]
        if len(pts) > 1:
            d.line(pts, fill=c, width=5, joint='curve')
        x0, y0 = pts[0]
        d.ellipse([x0 - 7, y0 - 7, x0 + 7, y0 + 7], fill=c)
        d.text((x0 - 3, y0 - 6), str(si + 1), fill='white', font=fnt)
        # arrow head at end
        if len(pts) > 1:
            x1, y1 = pts[-1]
            d.ellipse([x1 - 3, y1 - 3, x1 + 3, y1 + 3], outline=c, width=2)
im.save(out)
