import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';
import { BigButton, TopBar } from '../components/ui';
import { useStore } from '../store';
import { SPEAK_SENTENCES } from '../data/content';
import { t } from '../i18n';
import { say } from '../speech';

// Listen-and-repeat practice. (Automatic pronunciation scoring is planned for phase 2.)
export default function Speak({ onBack }: { onBack: () => void }) {
  const { uiLang, label, profile, pathName } = useStore();
  const [i, setI] = useState(0);
  const [scores, setScores] = useState<Record<number, boolean>>({});
  const s = SPEAK_SENTENCES[i];
  const langs = profile?.langs ?? ['en'];
  const good = Object.values(scores).filter(Boolean).length;

  const rate = (ok: boolean) => {
    setScores({ ...scores, [i]: ok });
    if (ok) setI((i + 1) % SPEAK_SENTENCES.length);
    else say(s.kn, 'kn', true);
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <TopBar title={t('sayAloud', uiLang)} subtitle={pathName} onBack={onBack} />

      <View style={styles.card}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: C.ink, textAlign: 'center' }}>{label(s, langs)}</Text>
        <Text style={{ fontSize: 32, fontWeight: '800', color: C.ink, textAlign: 'center' }}>{s.kn}</Text>
        <Text style={{ fontSize: 15, fontWeight: '600', color: C.ink, textAlign: 'center' }}>{s.roman}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
          <Pressable accessibilityRole="button" onPress={() => say(s.kn, 'kn')} style={[styles.pill, { backgroundColor: C.ink }]}>
            <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>▶ {t('listen', uiLang)}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => say(s.kn, 'kn', true)} style={[styles.pill, { backgroundColor: '#FFFFFF' }]}>
            <Text style={{ color: C.ink, fontWeight: '800' }}>0.6× {t('slow', uiLang)}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.tip}>
        <Text style={{ color: '#2E1A66', fontSize: 14, lineHeight: 20 }}>{t('howDidYouDo', uiLang)}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <BigButton label={t('again', uiLang)} onPress={() => rate(false)} color={C.marigold} shadow="#C98A0A" textColor={C.ink} style={{ flex: 1 }} />
        <BigButton label={t('easy', uiLang)} onPress={() => rate(true)} color={C.green} shadow="#0F7A35" textColor="#10251A" style={{ flex: 1 }} />
      </View>

      <View style={styles.dots}>
        {SPEAK_SENTENCES.map((_, k) => (
          <View
            key={k}
            style={{
              width: k === i ? 22 : 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: scores[k] === true ? C.green : scores[k] === false ? C.marigold : k === i ? C.magenta : '#E4DFEA',
            }}
          />
        ))}
      </View>
      <Text style={{ textAlign: 'center', color: C.muted, fontWeight: '700' }}>
        {good} / {SPEAK_SENTENCES.length}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, gap: 16, backgroundColor: C.bg, flexGrow: 1 },
  card: { backgroundColor: C.coral, borderRadius: 24, padding: 20, alignItems: 'center', gap: 8 },
  pill: { height: 44, paddingHorizontal: 16, borderRadius: 14, justifyContent: 'center' },
  tip: { backgroundColor: C.violetTint, borderRadius: 16, padding: 12 },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 8 },
});
