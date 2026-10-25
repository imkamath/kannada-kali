import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, Platform, StyleSheet, Text, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { C } from '../theme';

type Pt = { x: number; y: number };

const toPath = (pts: Pt[]) => {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${pts[0].x} ${pts[0].y} l0.1 0.1`;
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q${pts[i].x} ${pts[i].y} ${mx} ${my}`;
  }
  const last = pts[pts.length - 1];
  return d + ` L${last.x} ${last.y}`;
};

// A drawing pad with a faint letter underneath to trace over with a finger or the mouse.
export default function TracePad({
  letter,
  color = C.magenta,
  onStrokeStart,
  onStrokeEnd,
  strokesRef,
}: {
  letter: string;
  color?: string;
  onStrokeStart?: () => void;
  onStrokeEnd?: (totalLength: number) => void;
  strokesRef?: React.MutableRefObject<{ clear: () => void } | null>;
}) {
  const [strokes, setStrokes] = useState<Pt[][]>([]);
  const current = useRef<Pt[]>([]);
  const [, force] = useState(0);
  const size = useRef({ w: 300, h: 260 });
  const inkLength = useRef(0);

  if (strokesRef) {
    strokesRef.current = {
      clear: () => {
        current.current = [];
        inkLength.current = 0;
        setStrokes([]);
      },
    };
  }

  const point = (e: GestureResponderEvent): Pt => ({ x: e.nativeEvent.locationX, y: e.nativeEvent.locationY });

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          current.current = [point(e)];
          onStrokeStart?.();
          force((n) => n + 1);
        },
        onPanResponderMove: (e) => {
          const p = point(e);
          const pts = current.current;
          const last = pts[pts.length - 1];
          if (!last) return;
          const dist = Math.hypot(p.x - last.x, p.y - last.y);
          // ignore jitter and points outside the pad
          if (dist < 2 || p.x < 0 || p.y < 0 || p.x > size.current.w || p.y > size.current.h) return;
          inkLength.current += dist;
          pts.push(p);
          force((n) => n + 1);
        },
        onPanResponderRelease: () => {
          const done = current.current;
          current.current = [];
          if (done.length) setStrokes((s) => [...s, done]);
          onStrokeEnd?.(inkLength.current);
        },
        onPanResponderTerminate: () => {
          const done = current.current;
          current.current = [];
          if (done.length) setStrokes((s) => [...s, done]);
          onStrokeEnd?.(inkLength.current);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    size.current = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height };
  };

  const webNoScroll = Platform.OS === 'web' ? ({ touchAction: 'none', userSelect: 'none', cursor: 'crosshair' } as object) : null;

  return (
    <View style={[styles.pad, webNoScroll]} onLayout={onLayout} {...responder.panHandlers} accessibilityLabel={`Tracing area for ${letter}`}>
      <View style={styles.midline} pointerEvents="none" />
      <Text style={styles.guide} pointerEvents="none" selectable={false}>
        {letter}
      </Text>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        {strokes.map((s, i) => (
          <Path key={i} d={toPath(s)} stroke={color} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ))}
        {current.current.length ? (
          <Path d={toPath(current.current)} stroke={color} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ) : null}
      </Svg>
      {strokes.length === 0 && current.current.length === 0 ? (
        <Text style={styles.hint} pointerEvents="none">
          Trace the letter with your finger or mouse
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    height: 260,
    borderRadius: 18,
    backgroundColor: C.magentaTint,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E98BB2',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  midline: { position: 'absolute', left: 0, right: 0, top: '50%', borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#E98BB2' },
  guide: { fontSize: 210, lineHeight: 250, fontWeight: '700', color: '#F4C2D7', includeFontPadding: false, textAlign: 'center' },
  hint: { position: 'absolute', bottom: 8, left: 12, fontSize: 12, fontWeight: '600', color: '#7A1240' },
});
