import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { C, PALETTE } from '../theme';
import { SectionLabel, TopBar } from '../components/ui';
import { useStore, dayKey } from '../store';
import { UNITS } from '../data/content';
import { t } from '../i18n';
import { SyncCard } from '../components/SyncCard';

export default function Progress() {
  const { progress, uiLang, pathName, resetProfile } = useStore();

  // last 7 days
  const days = Array.from({ length: 7 }).map((_, k) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - k));
    return { key: dayKey(d), label: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()], xp: progress.dailyXp[dayKey(d)] ?? 0 };
  });
  const maxXp = Math.max(20, ...days.map((d) => d.xp));
  const weekXp = days.reduce((a, d) => a + d.xp, 0);
  const pct = Math.round((progress.completedUnits.length / UNITS.length) * 100);

  const badges = [
    { id: 'first', label: 'First lesson', glyph: 'ನ', color: '#F97316', on: progress.lessonsDone >= 1 },
    { id: 'num', label: 'Count to 10', glyph: '೧೦', color: C.marigold, on: progress.completedUnits.includes('num1') },
    { id: 'streak3', label: '3-day streak', glyph: '3', color: C.magenta, on: progress.streak >= 3 },
    { id: 'words50', label: '50 words', glyph: '50', color: C.teal, on: progress.learnedWords.length >= 50 },
    { id: 'streak7', label: '7-day streak', glyph: '7', color: C.violet, on: progress.streak >= 7 },
    { id: 'all', label: 'All units', glyph: '★', color: C.blue, on: progress.completedUnits.length >= UNITS.length },
  ];

  const stats = [
    { n: String(progress.streak), l: t('dayStreak', uiLang), bg: C.coralTint, fg: '#B23A1C' },
    { n: String(progress.learnedWords.length), l: t('wordsLearned', uiLang), bg: C.blueTint, fg: C.blueDark },
    { n: `${progress.completedUnits.length}/${UNITS.length}`, l: t('unitsDone', uiLang), bg: C.marigoldTint, fg: '#8A5300' },
    { n: String(progress.xp), l: t('totalXp', uiLang), bg: C.tealTint, fg: C.tealDark },
  ];

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <TopBar title={t('progress', uiLang)} subtitle={pathName} />

      <View style={styles.statGrid}>
        {stats.map((s) => (
          <View key={s.l} style={[styles.stat, { backgroundColor: s.bg }]}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: s.fg }}>{s.n}</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.ink2 }}>{s.l}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '800', fontSize: 15, color: C.ink }}>{t('thisWeek', uiLang)}</Text>
          <Text style={{ fontWeight: '700', fontSize: 13, color: C.violet }}>{weekXp} XP</Text>
        </View>
        <View style={styles.chart} accessibilityLabel={`XP this week: ${days.map((d) => d.xp).join(', ')}`}>
          {days.map((d, k) => (
            <View key={d.key} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
              <View style={{ width: '100%', height: Math.max(4, (d.xp / maxXp) * 80), borderRadius: 8, backgroundColor: d.xp ? PALETTE[k % PALETTE.length][0] : '#EEE9F5' }} />
              <Text style={{ fontSize: 11, color: k === 6 ? C.ink : C.muted, fontWeight: k === 6 ? '800' : '500' }}>{d.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <SyncCard />

      <SectionLabel>{t('badges', uiLang)}</SectionLabel>
      <View style={styles.badges}>
        {badges.map((b) => (
          <View key={b.id} style={{ width: '30%', alignItems: 'center', gap: 4 }}>
            <View style={[styles.badge, b.on ? { backgroundColor: b.color, borderColor: C.gold } : { backgroundColor: C.card, borderColor: '#BDB6CF', borderStyle: 'dashed' }]}>
              <Text style={{ fontWeight: '800', fontSize: 18, color: b.on ? (b.color === C.marigold || b.color === C.teal || b.color === '#F97316' ? C.ink : '#FFFFFF') : '#BDB6CF' }}>
                {b.on ? b.glyph : '🔒'}
              </Text>
            </View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: b.on ? C.ink : C.muted, textAlign: 'center' }}>{b.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.card, { borderWidth: 2, borderColor: C.violet }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '800', fontSize: 14, color: C.ink }}>{pathName}</Text>
          <Text style={{ fontWeight: '800', color: C.violet }}>{pct}%</Text>
        </View>
        <View style={{ height: 10, borderRadius: 999, backgroundColor: C.violetTint, overflow: 'hidden', marginTop: 8 }}>
          <View style={{ width: `${pct}%`, height: 10, backgroundColor: C.magenta }} />
        </View>
      </View>

      <Pressable accessibilityRole="button" onPress={resetProfile} style={styles.change}>
        <Text style={{ color: C.violet, fontWeight: '800' }}>+ {t('changePath', uiLang)}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, gap: 13, backgroundColor: C.bg },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: { width: '48.8%', borderRadius: 18, padding: 14 },
  card: { backgroundColor: C.card, borderRadius: 20, padding: 14 },
  chart: { flexDirection: 'row', gap: 8, height: 100, alignItems: 'flex-end', marginTop: 10 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  badge: { width: 56, height: 56, borderRadius: 28, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  change: { height: 48, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: '#9095AB', alignItems: 'center', justifyContent: 'center' },
});
