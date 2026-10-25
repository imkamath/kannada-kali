import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { C, pal } from '../theme';
import { SpeakButton, TopBar } from '../components/ui';
import { useStore } from '../store';
import { MONEY_TIME, NUMBERS_11_20, NUMBERS_1_10, NUMBERS_TENS, toKannadaDigits, type Item } from '../data/content';
import { t } from '../i18n';
import { say } from '../speech';

const SETS: { id: string; label: string; items: Item[]; unit: string; color: string; tint: string; ink: string }[] = [
  { id: 'a', label: '1–10', items: NUMBERS_1_10, unit: 'num1', color: C.marigold, tint: C.marigoldTint, ink: '#8A5300' },
  { id: 'b', label: '11–20', items: NUMBERS_11_20, unit: 'num2', color: C.magenta, tint: C.magentaTint, ink: '#B3165A' },
  { id: 'c', label: '10–1000', items: NUMBERS_TENS, unit: 'num3', color: C.teal, tint: C.tealTint, ink: C.tealDark },
  { id: 'd', label: '₹ & time', items: MONEY_TIME, unit: 'money', color: C.blue, tint: C.blueTint, ink: C.blueDark },
];

export default function Numbers({ onStartLesson }: { onStartLesson: (unitId: string) => void }) {
  const { uiLang, label, profile } = useStore();
  const [setId, setSetId] = useState('a');
  const set = SETS.find((s) => s.id === setId)!;
  const langs = profile?.langs ?? ['en'];

  const playAll = async () => {
    say(set.items.map((i) => i.kn).join(', '), 'kn');
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <TopBar
        title={`${t('numbers', uiLang)} · ಸಂಖ್ಯೆಗಳು`}
        subtitle={label({ en: 'Tap a number to hear it', hi: 'सुनने के लिए संख्या दबाएँ', mr: 'ऐकण्यासाठी संख्या दाबा', kn: 'ಕೇಳಲು ಒತ್ತಿ', roman: '' }, langs)}
        right={<SpeakButton text={set.items.map((i) => i.kn).join(', ')} bg={C.marigold} fg={C.ink} />}
      />

      <View style={{ flexDirection: 'row', gap: 6 }} accessibilityRole="tablist">
        {SETS.map((s) => {
          const on = s.id === setId;
          return (
            <Pressable
              key={s.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setSetId(s.id)}
              style={[styles.tab, { backgroundColor: on ? s.color : s.tint }]}
            >
              <Text style={{ fontSize: 13, fontWeight: '800', color: on ? (s.id === 'a' || s.id === 'c' ? C.ink : '#FFFFFF') : s.ink }}>{s.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.grid}>
        {set.items.map((n, i) => {
          const [solid, tint, onSolid] = pal(i);
          return (
            <Pressable key={n.kn + i} accessibilityRole="button" onPress={() => say(n.kn, 'kn')} style={[styles.card, { backgroundColor: tint }]}>
              <View style={[styles.tile, { backgroundColor: solid }]}>
                {n.digit !== undefined ? (
                  <>
                    <Text style={{ color: onSolid, fontSize: String(n.digit).length > 2 ? 16 : 24, fontWeight: '800' }}>{toKannadaDigits(n.digit)}</Text>
                    <Text style={{ color: onSolid, fontSize: 11, fontWeight: '800' }}>{n.digit}</Text>
                  </>
                ) : (
                  <Text style={{ color: onSolid, fontSize: 18, fontWeight: '800' }}>₹</Text>
                )}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: C.ink }} numberOfLines={2}>
                  {n.kn}
                </Text>
                <Text style={{ fontSize: 12, color: C.ink2 }}>{n.roman}</Text>
                <Text style={{ fontSize: 11, color: C.muted }} numberOfLines={2}>
                  {label(n, langs)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.market}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: '#D4E2FB' }}>AT THE MARKET</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>{langs.map((l) => MONEY_TIME[2][l]).join(' · ')} →</Text>
          <Text style={{ color: C.gold, fontSize: 22, fontWeight: '800' }}>ಐವತ್ತು ರೂಪಾಯಿ</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => onStartLesson(set.unit)} style={styles.quizBtn}>
          <Text style={{ fontWeight: '800', color: C.ink }}>{t('countGame', uiLang)}</Text>
        </Pressable>
      </View>
      <Pressable onPress={playAll} accessibilityRole="button" style={{ alignSelf: 'center', padding: 8 }}>
        <Text style={{ color: C.violet, fontWeight: '800' }}>▶ {t('listen', uiLang)} 1…{set.items.length}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, gap: 12, backgroundColor: C.bg },
  tab: { flex: 1, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { width: '48.8%', flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 16 },
  tile: { width: 52, height: 58, borderRadius: 13, alignItems: 'center', justifyContent: 'center', gap: 2 },
  market: { backgroundColor: C.blueDark, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  quizBtn: { height: 44, paddingHorizontal: 14, borderRadius: 14, backgroundColor: C.gold, justifyContent: 'center' },
});
