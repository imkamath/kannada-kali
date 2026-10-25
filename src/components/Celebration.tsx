import React, { useEffect, useMemo, useRef } from 'react';
import { AccessibilityInfo, Animated, Dimensions, Easing, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { C, pal } from '../theme';
import { BigButton } from './ui';
import { useStore } from '../store';
import { t } from '../i18n';
import { say } from '../speech';

const { width: W, height: H } = Dimensions.get('window');
const PETAL_COLORS = ['#F59E0B', '#F97316', '#FBC54A', '#D6246E', '#FFFFFF', '#0E9F8E', '#2563EB'];

function Petal({ i, reduce }: { i: number; reduce: boolean }) {
  const fall = useRef(new Animated.Value(0)).current;
  const cfg = useMemo(
    () => ({
      left: (i * 53) % W,
      size: 10 + (i % 4) * 3,
      delay: (i * 370) % 4000,
      duration: 4200 + (i % 5) * 600,
      sway: 20 + (i % 3) * 14,
      color: PETAL_COLORS[i % PETAL_COLORS.length],
      round: i % 3 !== 0,
    }),
    [i],
  );

  useEffect(() => {
    if (reduce) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(cfg.delay),
        Animated.timing(fall, { toValue: 1, duration: cfg.duration, easing: Easing.linear, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [fall, cfg, reduce]);

  const translateY = fall.interpolate({ inputRange: [0, 1], outputRange: [-40, H + 40] });
  const translateX = fall.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, cfg.sway, 0, -cfg.sway, 0] });
  const rotate = fall.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: reduce ? ((i * 97) % (H * 0.5)) : 0,
        left: cfg.left,
        width: cfg.size,
        height: cfg.round ? cfg.size * 1.4 : cfg.size,
        borderRadius: cfg.round ? cfg.size : 2,
        backgroundColor: cfg.color,
        transform: [{ translateY: reduce ? 0 : translateY }, { translateX }, { rotate }],
      }}
    />
  );
}

// Marigold drawn from rotated petal ellipses.
function Marigold({ size = 128 }: { size?: number }) {
  const outer = Array.from({ length: 12 });
  const inner = Array.from({ length: 8 });
  const c = size / 2;
  return (
    <View style={{ width: size, height: size }} accessibilityRole="image" accessibilityLabel="Marigold flower">
      {outer.map((_, k) => (
        <View
          key={'o' + k}
          style={[
            styles.petal,
            {
              width: size * 0.25,
              height: size * 0.36,
              left: c - size * 0.125,
              top: c - size * 0.5,
              backgroundColor: '#F97316',
              transform: [{ translateY: size * 0.32 }, { rotate: `${k * 30}deg` }, { translateY: -size * 0.32 }],
            },
          ]}
        />
      ))}
      {inner.map((_, k) => (
        <View
          key={'i' + k}
          style={[
            styles.petal,
            {
              width: size * 0.2,
              height: size * 0.28,
              left: c - size * 0.1,
              top: c - size * 0.36,
              backgroundColor: '#F59E0B',
              transform: [{ translateY: size * 0.22 }, { rotate: `${k * 45 + 15}deg` }, { translateY: -size * 0.22 }],
            },
          ]}
        />
      ))}
      <View style={{ position: 'absolute', left: c - size * 0.16, top: c - size * 0.16, width: size * 0.32, height: size * 0.32, borderRadius: size, backgroundColor: C.gold }} />
      <View style={{ position: 'absolute', left: c - size * 0.08, top: c - size * 0.08, width: size * 0.16, height: size * 0.16, borderRadius: size, backgroundColor: '#B45309' }} />
    </View>
  );
}

function Garland() {
  const n = Math.ceil(W / 38);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60 }}>
      {Array.from({ length: n }).map((_, k) => {
        const x = k * 38 + 10;
        const phase = (x / W) * 2 * Math.PI;
        const y = 8 + Math.abs(Math.sin(phase)) * 32;
        const orange = k % 3 !== 2;
        return (
          <View
            key={k}
            style={{ position: 'absolute', left: x, top: y, width: orange ? 20 : 14, height: orange ? 20 : 14, borderRadius: 20, backgroundColor: orange ? (k % 2 ? '#F97316' : '#F59E0B') : '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}
          >
            {orange ? <View style={{ width: 8, height: 8, borderRadius: 8, backgroundColor: '#B45309' }} /> : null}
          </View>
        );
      })}
    </View>
  );
}

export default function Celebration({
  unitTitle,
  xp,
  streak,
  accuracy,
  words,
  onContinue,
}: {
  unitTitle: string;
  xp: number;
  streak: number;
  accuracy: number;
  words: string[];
  onContinue: () => void;
}) {
  const { uiLang, uiLang2 } = useStore();
  const pop = useRef(new Animated.Value(0)).current;
  const [reduce, setReduce] = React.useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
    say('ಅದ್ಭುತ!', 'kn');
  }, [pop]);

  const stars = accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : 1;
  const bilingual = (k: Parameters<typeof t>[0]) => t(k, uiLang) + (uiLang2 ? ` · ${t(k, uiLang2)}` : '');

  const share = () =>
    Share.share({
      message: `ಅದ್ಭುತ! I just finished "${unitTitle}" in Kannada Kali — +${xp} XP and a ${streak}-day streak! 🌼`,
    }).catch(() => {});

  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      {Array.from({ length: 18 }).map((_, i) => (
        <Petal key={i} i={i} reduce={reduce} />
      ))}
      <Garland />

      <Animated.View style={[styles.sheet, { transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }], opacity: pop }]}>
        <View style={styles.flowerWrap}>
          <Marigold />
        </View>

        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }} accessibilityLabel={`${stars} of 3 stars`}>
          {[0, 1, 2].map((k) => (
            <Text key={k} style={{ fontSize: k === 1 ? 40 : 32, color: k < stars ? C.gold : '#E4DFEA', marginTop: k === 1 ? -8 : 0 }}>
              ★
            </Text>
          ))}
        </View>

        <Text style={{ fontSize: 42, fontWeight: '900', color: C.magenta }}>ಅದ್ಭುತ!</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: C.ink }}>{bilingual('wonderful')}</Text>
        <Text style={{ fontSize: 14, color: C.muted, textAlign: 'center' }}>
          {t('youFinished', uiLang)} <Text style={{ fontWeight: '800', color: C.ink }}>{unitTitle}</Text>
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, alignSelf: 'stretch' }}>
          <View style={[styles.stat, { backgroundColor: C.marigoldTint }]}>
            <Text style={[styles.statNum, { color: '#8A5300' }]}>+{xp}</Text>
            <Text style={styles.statLbl}>XP</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: C.coralTint }]}>
            <Text style={[styles.statNum, { color: '#B23A1C' }]}>{streak}</Text>
            <Text style={styles.statLbl}>{t('dayStreak', uiLang)}</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: C.greenTint }]}>
            <Text style={[styles.statNum, { color: C.greenDark }]}>{accuracy}%</Text>
            <Text style={styles.statLbl}>{t('accuracy', uiLang)}</Text>
          </View>
        </View>

        <View style={styles.words}>
          <Text style={styles.wordsLbl}>{t('newWords', uiLang)}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {words.map((w, k) => (
              <Text key={k} style={[styles.word, { backgroundColor: pal(k)[1], color: pal(k)[3] }]}>
                {w}
              </Text>
            ))}
          </View>
        </View>

        <BigButton label={t('continueUnit', uiLang)} onPress={onContinue} style={{ alignSelf: 'stretch' }} />
        <Pressable accessibilityRole="button" onPress={share} style={styles.share}>
          <Text style={{ fontWeight: '800', color: C.violet, fontSize: 15 }}>{t('share', uiLang)}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(42,26,94,0.96)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  sheet: { width: '100%', maxWidth: 420, backgroundColor: C.bg, borderRadius: 30, paddingTop: 74, paddingHorizontal: 20, paddingBottom: 18, alignItems: 'center', gap: 10 },
  flowerWrap: { position: 'absolute', top: -60, alignSelf: 'center' },
  petal: { position: 'absolute', borderRadius: 999 },
  stat: { flex: 1, borderRadius: 16, paddingVertical: 10, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLbl: { fontSize: 12, fontWeight: '600', color: C.ink2 },
  words: { alignSelf: 'stretch', backgroundColor: C.card, borderRadius: 16, padding: 12, gap: 6 },
  wordsLbl: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', color: C.muted },
  word: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden', fontSize: 17, fontWeight: '800' },
  share: { alignSelf: 'stretch', height: 46, borderRadius: 16, borderWidth: 2, borderColor: C.violet, alignItems: 'center', justifyContent: 'center' },
});
