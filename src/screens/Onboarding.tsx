import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';
import { BigButton, SectionLabel } from '../components/ui';
import { useStore, type Direction } from '../store';
import type { BaseLang } from '../data/content';

const LANGS: { id: BaseLang; native: string; en: string; glyph: string; color: string; tint: string; ink: string; water: string }[] = [
  { id: 'en', native: 'English', en: 'English', glyph: 'A', color: C.blue, tint: C.blueTint, ink: '#FFFFFF', water: 'Water' },
  { id: 'hi', native: 'हिंदी', en: 'Hindi', glyph: 'हि', color: C.marigold, tint: C.marigoldTint, ink: C.ink, water: 'पानी' },
  { id: 'mr', native: 'मराठी', en: 'Marathi', glyph: 'म', color: C.magenta, tint: C.magentaTint, ink: '#FFFFFF', water: 'पाणी' },
];

export default function Onboarding() {
  const { setProfile, profile } = useStore();
  const [sel, setSel] = useState<BaseLang[]>(profile?.langs ?? ['en']);
  const [dir, setDir] = useState<Direction>(profile?.direction ?? 'learn');

  const toggle = (id: BaseLang) => {
    let next = sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id];
    if (next.length === 0) next = [id];
    if (next.length > 2) next = next.slice(next.length - 2);
    // keep a stable order: en, hi, mr
    next = LANGS.map((l) => l.id).filter((x) => next.includes(x));
    setSel(next);
  };

  const chosen = LANGS.filter((l) => sel.includes(l.id));
  const joint = chosen.length === 2;
  const names = chosen.map((l) => l.native).join(' + ');

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={styles.logo}>
          <View style={[styles.logoCell, { backgroundColor: C.magenta }]} />
          <View style={[styles.logoCell, { backgroundColor: C.marigold }]} />
          <View style={[styles.logoCell, { backgroundColor: C.teal }]} />
          <View style={[styles.logoCell, { backgroundColor: C.violet }]} />
        </View>
        <Text style={{ fontSize: 20, fontWeight: '800', color: C.ink }}>Kannada Kali · ಕನ್ನಡ ಕಲಿ</Text>
      </View>

      <Text style={styles.h1}>
        <Text style={{ color: C.magenta }}>ನಮಸ್ಕಾರ! </Text>Let's set up your path
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <SectionLabel>1 · Languages you know</SectionLabel>
        <Text style={{ fontSize: 12, fontWeight: '800', color: C.violet }}>Pick 1 or 2</Text>
      </View>
      <View style={{ gap: 8 }}>
        {LANGS.map((l) => {
          const on = sel.includes(l.id);
          return (
            <Pressable
              key={l.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              onPress={() => toggle(l.id)}
              style={[styles.langCard, { backgroundColor: on ? l.tint : C.card, borderColor: on ? l.color : C.line }]}
            >
              <View style={[styles.tile, { backgroundColor: l.color }]}>
                <Text style={{ color: l.ink, fontWeight: '800', fontSize: 17 }}>{l.glyph}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: C.ink }}>{l.native}</Text>
                <Text style={{ fontSize: 13, color: C.muted }}>{l.en}</Text>
              </View>
              <View style={[styles.box, { backgroundColor: on ? l.color : C.card, borderColor: on ? l.color : '#BDB6CF' }]}>
                {on ? <Text style={{ color: l.ink, fontWeight: '900', fontSize: 14 }}>✓</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      {joint ? (
        <View style={styles.joint}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.jointTag}>JOINT MODE</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>{names}</Text>
          </View>
          <Text style={{ color: '#F1ECFD', fontSize: 14 }}>Every word shows in both languages:</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
            {chosen.map((l) => l.water).join(' · ')} → <Text style={{ color: C.gold, fontSize: 22 }}>ನೀರು</Text>
          </Text>
        </View>
      ) : null}

      <SectionLabel>2 · Direction</SectionLabel>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(
          [
            { id: 'learn', title: 'Learn ಕನ್ನಡ', sub: `Explained in ${chosen.map((l) => l.en).join(' + ')}` },
            { id: 'teach', title: `Learn ${names}`, sub: 'ಕನ್ನಡದಿಂದ ಕಲಿಯಿರಿ · explained in Kannada' },
          ] as const
        ).map((d) => {
          const on = dir === d.id;
          return (
            <Pressable
              key={d.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => setDir(d.id)}
              style={[styles.dirCard, { backgroundColor: on ? C.marigoldTint : C.card, borderColor: on ? C.marigold : C.line }]}
            >
              <Text style={{ fontSize: 16, fontWeight: '800', color: C.ink }}>{d.title}</Text>
              <Text style={{ fontSize: 12, color: C.muted, lineHeight: 16 }}>{d.sub}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1, minHeight: 16 }} />
      <BigButton label="Start learning" onPress={() => setProfile({ langs: sel, direction: dir })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, padding: 20, gap: 14, backgroundColor: C.bg },
  logo: { width: 40, height: 40, flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  logoCell: { width: 18.5, height: 18.5, borderRadius: 5 },
  h1: { fontSize: 28, fontWeight: '800', color: C.ink, lineHeight: 34, marginTop: 6 },
  langCard: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderWidth: 2 },
  tile: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  box: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  joint: { backgroundColor: C.violet, borderRadius: 18, padding: 14, gap: 6 },
  jointTag: { fontSize: 11, fontWeight: '800', backgroundColor: C.gold, color: C.ink, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  dirCard: { flex: 1, minHeight: 92, padding: 12, borderRadius: 18, borderWidth: 2, gap: 6 },
});
