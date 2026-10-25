import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { C, pal } from '../theme';
import { SectionLabel, SpeakButton, TopBar } from '../components/ui';
import TracePad from '../components/TracePad';
import { useStore } from '../store';
import { CONSONANTS, VOWELS, type Letter } from '../data/content';
import { t } from '../i18n';
import { say } from '../speech';

export default function Script() {
  const { uiLang, profile } = useStore();
  const [sel, setSel] = useState<Letter>(VOWELS[0]);
  const [scrollOn, setScrollOn] = useState(true);
  const [traced, setTraced] = useState<string[]>([]);
  const ALL = [...VOWELS, ...CONSONANTS];
  const showDeva = (profile?.langs ?? []).some((l) => l === 'hi' || l === 'mr') || profile?.direction === 'teach';
  const devaName = profile?.langs.includes('mr') && !profile?.langs.includes('hi') ? 'मराठी' : 'हिंदी / मराठी';

  const pick = (l: Letter) => {
    setSel(l);
    say(l.kn, 'kn');
  };
  const nextLetter = () => {
    pick(ALL[(ALL.indexOf(sel) + 1) % ALL.length]);
  };

  const Grid = ({ letters, offset }: { letters: Letter[]; offset: number }) => (
    <View style={styles.grid}>
      {letters.map((l, i) => {
        const on = l === sel;
        const [solid, tint, onSolid] = pal(i + offset);
        return (
          <Pressable
            key={l.kn}
            accessibilityRole="button"
            accessibilityLabel={`${l.kn} ${l.roman}`}
            onPress={() => pick(l)}
            style={[styles.cell, { backgroundColor: on ? solid : tint }]}
          >
            <Text style={{ fontSize: 22, fontWeight: '800', color: on ? onSolid : C.ink }}>{l.kn}</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: on ? onSolid : C.muted }}>
              {traced.includes(l.kn) ? '✓ ' : ''}
              {l.roman}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.wrap} scrollEnabled={scrollOn}>
      <TopBar title={`${t('script', uiLang)} · ಲಿಪಿ`} subtitle={t('tapToHear', uiLang)} />

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={[styles.big, { backgroundColor: C.magenta }]}>
          <Text style={{ fontSize: 46, fontWeight: '800', color: '#FFFFFF' }}>{sel.kn}</Text>
          <Text style={styles.bigLbl}>ಕನ್ನಡ</Text>
        </View>
        {showDeva ? (
          <View style={[styles.big, { backgroundColor: C.marigold }]}>
            <Text style={{ fontSize: 40, fontWeight: '700', color: C.ink }}>{sel.deva.replace('*', '')}</Text>
            <Text style={[styles.bigLbl, { color: C.ink }]}>{devaName}</Text>
          </View>
        ) : null}
        <View style={[styles.big, { backgroundColor: C.blue }]}>
          <Text style={{ fontSize: 34, fontWeight: '800', color: '#FFFFFF' }}>{sel.roman}</Text>
          <Text style={styles.bigLbl}>sound</Text>
        </View>
      </View>
      {sel.note ? (
        <View style={styles.note}>
          <Text style={{ color: '#4A2E00', fontSize: 14 }}>
            <Text style={{ fontWeight: '800' }}>{sel.kn}: </Text>
            {sel.note}
          </Text>
        </View>
      ) : null}

      <View style={styles.traceCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: C.ink }}>
            Trace · ಬರೆಯಿರಿ <Text style={{ color: C.magenta }}>{sel.kn}</Text>
          </Text>
          <SpeakButton text={sel.kn} bg={C.magentaTint} fg={C.magenta} />
        </View>
        <TracePad
          letter={sel.kn}
          onDrawStart={() => setScrollOn(false)}
          onDrawEnd={() => setScrollOn(true)}
          onComplete={() => {
            const k = sel.kn;
            setTraced((tr) => (tr.includes(k) ? tr : [...tr, k]));
            say(sel.kn, 'kn');
          }}
        />
        <Pressable accessibilityRole="button" onPress={nextLetter} style={[styles.traceBtn, { backgroundColor: C.magenta, flex: 0 }]}>
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>Next letter ›</Text>
        </Pressable>
        <Text style={{ fontSize: 12, color: C.muted, textAlign: 'center' }}>
          {traced.length} / {ALL.length} letters traced
        </Text>
      </View>

      <SectionLabel>{t('vowels', uiLang)} · ಸ್ವರಗಳು</SectionLabel>
      <Grid letters={VOWELS} offset={0} />

      <SectionLabel>{t('consonants', uiLang)} · ವ್ಯಂಜನಗಳು</SectionLabel>
      <Grid letters={CONSONANTS} offset={3} />

      <View style={styles.tip}>
        <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: C.gold }}>WATCH OUT</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 14, lineHeight: 21 }}>
          ಎ and ಒ are short e / o — Devanagari has no separate letter for them. Good news: ಳ sounds just like Marathi ळ. Most Kannada words end in a vowel (ನೀರು nīru, ಹಾಲು hālu).
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, gap: 12, backgroundColor: C.bg },
  big: { flex: 1, borderRadius: 18, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', minHeight: 96 },
  bigLbl: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  note: { backgroundColor: C.marigoldTint, borderRadius: 14, padding: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: { width: '13.3%', aspectRatio: 0.9, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  traceCard: { backgroundColor: C.card, borderRadius: 22, padding: 14, gap: 12 },
  traceBtn: { flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  praise: { textAlign: 'center', fontSize: 18, fontWeight: '800', color: C.greenDark },
  tip: { backgroundColor: C.tealDark, borderRadius: 18, padding: 14, gap: 4 },
});
