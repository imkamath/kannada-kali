import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Platform, Pressable, StyleSheet, Text, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, G, Path, Polygon, Text as SvgText } from 'react-native-svg';
import { C } from '../theme';
import { STROKES } from '../data/strokes';

type Pt = { x: number; y: number };

const PAD_H = 290;
const STROKE_COLORS = [C.magenta, C.blue, C.teal, '#C2410C', C.violet, C.green];

// ---- geometry helpers (all in the 0..100 letter box) ----
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const pathLen = (p: Pt[]) => p.reduce((s, q, i) => (i ? s + dist(p[i - 1], q) : 0), 0);

function resample(p: Pt[], n: number): Pt[] {
  if (p.length < 2) return p.slice();
  const L = pathLen(p);
  const step = L / (n - 1);
  const out: Pt[] = [p[0]];
  let acc = 0;
  for (let i = 1; i < p.length; i++) {
    let a = p[i - 1];
    const b = p[i];
    let d = dist(a, b);
    while (acc + d >= step && out.length < n) {
      const t = (step - acc) / d;
      const q = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      out.push(q);
      a = q;
      d = dist(a, b);
      acc = 0;
    }
    acc += d;
  }
  while (out.length < n) out.push(p[p.length - 1]);
  return out;
}

const minDistTo = (q: Pt, path: Pt[]) => path.reduce((m, r) => Math.min(m, dist(q, r)), Infinity);

// How well a drawn path matches the expected stroke.
function judge(user: Pt[], expected: Pt[]) {
  const exp = resample(expected, 32);
  const usr = resample(user, 32);
  const coverage = exp.filter((q) => minDistTo(q, user) < 13).length / exp.length;
  const accuracy = usr.reduce((s, q) => s + minDistTo(q, exp), 0) / usr.length;
  const startOk = dist(user[0], exp[0]) < 20;
  const closed = dist(exp[0], exp[exp.length - 1]) < 10;
  const backwards = !closed && dist(user[0], exp[exp.length - 1]) + 4 < dist(user[0], exp[0]);
  const ok = startOk && !backwards && coverage >= 0.72 && accuracy < 12;
  let hint = '';
  if (backwards) hint = 'Other way — start at the numbered dot';
  else if (!startOk) hint = 'Start at the numbered dot';
  else if (coverage < 0.72) hint = 'Follow the line all the way to the end';
  else if (accuracy >= 12) hint = 'Stay closer to the line';
  return { ok, hint };
}

const toD = (pts: Pt[]) => {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${pts[0].x} ${pts[0].y} l0.01 0.01`;
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const l = pts[pts.length - 1];
  return d + ` L${l.x.toFixed(1)} ${l.y.toFixed(1)}`;
};

// Part of a path up to fraction t (0..1) of its length.
function partial(p: Pt[], t: number): Pt[] {
  if (t >= 1) return p;
  const target = pathLen(p) * t;
  const out: Pt[] = [p[0]];
  let acc = 0;
  for (let i = 1; i < p.length; i++) {
    const d = dist(p[i - 1], p[i]);
    if (acc + d >= target) {
      const u = (target - acc) / (d || 1);
      out.push({ x: p[i - 1].x + (p[i].x - p[i - 1].x) * u, y: p[i - 1].y + (p[i].y - p[i - 1].y) * u });
      return out;
    }
    acc += d;
    out.push(p[i]);
  }
  return out;
}

// Arrow head placed ~35% along a stroke, pointing in the writing direction.
function arrowAt(p: Pt[]) {
  const pp = partial(p, 0.38);
  const a = pp[Math.max(0, pp.length - 2)];
  const b = pp[pp.length - 1];
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  const s = 4.2;
  const pts = [
    [b.x + Math.cos(ang) * s, b.y + Math.sin(ang) * s],
    [b.x + Math.cos(ang + 2.5) * s, b.y + Math.sin(ang + 2.5) * s],
    [b.x + Math.cos(ang - 2.5) * s, b.y + Math.sin(ang - 2.5) * s],
  ];
  return pts.map((q) => q.join(',')).join(' ');
}

// Guided tracing: numbered start dots, direction arrows, "Show me" animation and a check of every stroke.
export default function TracePad({
  letter,
  onComplete,
  onDrawStart,
  onDrawEnd,
}: {
  letter: string;
  onComplete?: () => void;
  onDrawStart?: () => void;
  onDrawEnd?: () => void;
}) {
  const strokes: Pt[][] = useMemo(() => (STROKES[letter] ?? []).map((s) => s.map(([x, y]) => ({ x, y }))), [letter]);
  const [step, setStep] = useState(0); // index of the stroke to draw next
  const [live, setLive] = useState<Pt[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [demo, setDemo] = useState<{ stroke: number; t: number } | null>(null);
  const box = useRef({ ox: 0, oy: 0, b: 100, w: 300, h: PAD_H });
  const [, force] = useState(0);
  const liveRef = useRef<Pt[]>([]);
  const stepRef = useRef(0);
  const done = step >= strokes.length && strokes.length > 0;

  useEffect(() => {
    setStep(0);
    stepRef.current = 0;
    setLive([]);
    setHint(null);
    setDemo(null);
  }, [letter]);

  // "Show me" animation
  useEffect(() => {
    if (!demo) return;
    const id = setTimeout(() => {
      const nt = demo.t + 0.06;
      if (nt < 1) setDemo({ stroke: demo.stroke, t: nt });
      else if (demo.stroke + 1 < strokes.length) setDemo({ stroke: demo.stroke + 1, t: 0 });
      else setTimeout(() => setDemo(null), 500);
    }, 30);
    return () => clearTimeout(id);
  }, [demo, strokes.length]);

  const toUnits = (e: GestureResponderEvent): Pt => {
    const { ox, oy, b } = box.current;
    return { x: ((e.nativeEvent.locationX - ox) / b) * 100, y: ((e.nativeEvent.locationY - oy) / b) * 100 };
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          onDrawStart?.();
          liveRef.current = [toUnits(e)];
          setLive(liveRef.current);
          setHint(null);
          setDemo(null);
        },
        onPanResponderMove: (e) => {
          const p = toUnits(e);
          const pts = liveRef.current;
          const last = pts[pts.length - 1];
          if (last && dist(p, last) < 0.8) return;
          liveRef.current = [...pts, p];
          setLive(liveRef.current);
        },
        onPanResponderRelease: () => finish(),
        onPanResponderTerminate: () => finish(),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [strokes],
  );

  function finish() {
    onDrawEnd?.();
    const user = liveRef.current;
    liveRef.current = [];
    setLive([]);
    const i = stepRef.current;
    if (i >= strokes.length || user.length < 2) return;
    const r = judge(user, strokes[i]);
    if (r.ok) {
      stepRef.current = i + 1;
      setStep(i + 1);
      setHint(null);
      if (i + 1 >= strokes.length) onComplete?.();
    } else {
      setHint(r.hint);
    }
  }

  const restart = () => {
    stepRef.current = 0;
    setStep(0);
    setLive([]);
    setHint(null);
    setDemo(null);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    const b = Math.min(width, height) - 20;
    box.current = { ox: (width - b) / 2, oy: (height - b) / 2, b, w: width, h: height };
    force((n) => n + 1);
  };
  const { ox, oy, b, w, h } = box.current;
  const sc = b / 100;
  const webNoScroll = Platform.OS === 'web' ? ({ touchAction: 'none', userSelect: 'none', cursor: 'crosshair' } as object) : null;
  const cur = strokes[step];

  if (!strokes.length) {
    return (
      <View style={[styles.pad, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ fontSize: 120, color: '#F4C2D7' }}>{letter}</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      <View style={[styles.pad, webNoScroll]} onLayout={onLayout} {...responder.panHandlers} accessibilityLabel={`Tracing area for ${letter}`}>
        <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
          <G transform={`translate(${ox} ${oy}) scale(${sc})`}>
            {/* the whole letter, faint */}
            {strokes.map((s, i) => (
              <Path key={'g' + i} d={toD(s)} stroke="#F6CFDF" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            ))}
            {/* strokes already done */}
            {strokes.slice(0, step).map((s, i) => (
              <Path key={'d' + i} d={toD(s)} stroke={STROKE_COLORS[i % STROKE_COLORS.length]} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            ))}
            {/* the stroke to draw now: dashed centre line, arrow, numbered start dot */}
            {cur && !demo ? (
              <>
                <Path d={toD(cur)} stroke="#E07AA5" strokeWidth={1.2} strokeDasharray="2.5 2.5" fill="none" />
                <Polygon points={arrowAt(cur)} fill="#B3165A" />
              </>
            ) : null}
            {/* demo animation */}
            {demo
              ? strokes.slice(0, demo.stroke + 1).map((s, i) => (
                  <Path
                    key={'a' + i}
                    d={toD(i < demo.stroke ? s : partial(s, demo.t))}
                    stroke={STROKE_COLORS[i % STROKE_COLORS.length]}
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ))
              : null}
            {/* numbered start dots for the remaining strokes */}
            {!demo
              ? strokes.map((s, i) =>
                  i >= step ? (
                    <G key={'n' + i}>
                      <Circle cx={s[0].x} cy={s[0].y} r={i === step ? 5 : 3.6} fill={i === step ? C.green : '#B9B2CC'} />
                      <SvgText x={s[0].x} y={s[0].y + (i === step ? 1.9 : 1.4)} fontSize={i === step ? 5.2 : 4} fontWeight="bold" fill="#FFFFFF" textAnchor="middle">
                        {String(i + 1)}
                      </SvgText>
                    </G>
                  ) : null,
                )
              : null}
            {/* what the learner is drawing right now */}
            {live.length ? (
              <Path d={toD(live)} stroke={STROKE_COLORS[step % STROKE_COLORS.length]} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.85} />
            ) : null}
          </G>
        </Svg>
        <View style={styles.status} pointerEvents="none">
          <Text style={[styles.statusText, hint ? { color: C.red } : done ? { color: C.greenDark } : null]}>
            {hint ?? (done ? 'ಚೆನ್ನಾಗಿದೆ! Well done · शाबाश!' : `Stroke ${step + 1} of ${strokes.length} · start at the green dot`)}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable accessibilityRole="button" onPress={() => { restart(); setDemo({ stroke: 0, t: 0 }); }} style={[styles.btn, { backgroundColor: C.violetTint }]}>
          <Text style={[styles.btnText, { color: C.violet }]}>▶ Show me</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={restart} style={[styles.btn, { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: C.magenta }]}>
          <Text style={[styles.btnText, { color: '#B3165A' }]}>Start again</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    height: PAD_H,
    borderRadius: 18,
    backgroundColor: '#FFF4F8',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E98BB2',
    overflow: 'hidden',
  },
  status: { position: 'absolute', left: 10, right: 10, bottom: 8, alignItems: 'center' },
  statusText: { fontSize: 13, fontWeight: '800', color: '#7A1240', backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  btn: { flex: 1, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontWeight: '800', fontSize: 15 },
});
