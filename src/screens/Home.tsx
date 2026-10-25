import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { C, pal } from '../theme';
import { SectionLabel, SpeakButton } from '../components/ui';
import { useStore, dayKey } from '../store';
import { UNITS, type Lang } from '../data/content';
import { t } from '../i18n';

export default function Home({ onStartLesson, onOpenSpeak }: { onStartLesson: (unitId: string) => void; onOpenSpeak: () => void }) {
  const { progress, uiLang, uiLang2, pathName, resetProfile, promptLangs, targetLangs, label, profile } = useStore();
  const teach = profile?.direction === 'teach';
  const done = progress.completedUnits;
  const nextIndex = Math.max(0, UNITS.findIndex((u) => !done.includes(u.id)));
  const allDone = done.length >= UNITS.length;
  const current = UNITS[allDone ? 0 : nextIndex];
  const todayXp = progress.dailyXp[dayKey()] ?? 0;
  const goal = 20;
  const pct = Math.min(1, todayXp / goal);

  // word of the day: rotate through all words by date
  const allWords = UNITS.filter((u) => u.kind === 'words').flatMap((u) => u.items);
  const d = new Date();
  const wod = allWords[(d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % allWords.length];

  const title = (key: Parameters<typeof t>[0]) => t(key, uiLang) + (uiLang2 ? ` · ${t(key, uiLang2)}` : '');
  const unitTitle = (u: (typeof UNITS)[number]) => {
    const langs: Lang[] = teach ? ['kn', ...targetLangs] : promptLangs;
    return langs.map((l) => u.title[l]).join(' · ');
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('changePath', uiLang)}
          onPress={() =>
            Alert.alert(t('changePath', uiLang), pathName, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'OK', onPress: resetProfile },
            ])
          }
          style={styles.pathChip}
        >
          <Text style={{ color: C.violet, fontWeight: '800', fontSize: 14 }} numberOfLines={1}>
            {pathName} ▾
          </Text>
        </Pressable>
        <View style={styles.streak} accessibilityLabel={`${progress.streak} ${t('dayStreak', 'en')}`}>
          <Text style={{ fontSize: 16 }}>🔥</Text>
          <Text style={{ fontWeight: '800', color: '#B23A1C', fontSize: 15 }}>{progress.streak}</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <View style={[styles.blob, { right: -24, top: -24, width: 110, height: 110, backgroundColor: '#7448D6' }]} />
        <View style={[styles.blob, { right: 40, bottom: -40, width: 80, height: 80, backgroundColor: C.magenta }]} />
        <View style={styles.ring}>
          <View style={[styles.ringFill, { height: `${pct * 100}%` }]} />
          <View style={styles.ringInner}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>{todayXp}</Text>
            <Text style={{ color: '#E2D8FB', fontSize: 11 }}>/ {goal} XP</Text>
          </View>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: '#E2D8FB', fontSize: 13 }}>
            {t('continueUnit', uiLang)} · {UNITS.indexOf(current) + 1}
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>
            {current.title[uiLang]} · <Text style={{ color: C.gold }}>{teach ? targetLangs.map((l) => current.title[l]).join(' · ') : current.title.kn}</Text>
          </Text>
          <Pressable accessibilityRole="button" onPress={() => onStartLesson(current.id)} style={styles.heroBtn}>
            <Text style={{ fontWeight: '800', color: C.ink, fontSize: 15 }}>{t('startLesson', uiLang)}</Text>
          </Pressable>
        </View>
      </View>

      <SectionLabel>{title('yourCourse')}</SectionLabel>
      <View style={{ gap: 8 }}>
        {UNITS.map((u, i) => {
          const isDone = done.includes(u.id);
          const unlocked = isDone || i <= nextIndex || allDone;
          const isCurrent = !allDone && i === nextIndex;
          const [solid, , onSolid] = pal(i);
          const sample = u.items.slice(0, 3).map((it) => it.kn).join(', ');
          return (
            <Pressable
              key={u.id}
              accessibilityRole="button"
              accessibilityState={{ disabled: !unlocked }}
              onPress={() => (unlocked ? onStartLesson(u.id) : Alert.alert(t('locked', uiLang)))}
              style={[styles.unit, isCurrent && { borderColor: C.violet, borderWidth: 2 }]}
            >
              <View style={[styles.unitTile, { backgroundColor: unlocked ? solid : '#F1EEF6' }]}>
                <Text style={{ color: unlocked ? onSolid : C.muted, fontWeight: '800', fontSize: u.icon.length > 2 ? 14 : 19 }}>
                  {unlocked ? u.icon : '🔒'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: unlocked ? C.ink : C.ink2 }} numberOfLines={1}>
                  {i + 1} · {unitTitle(u)}
                </Text>
                <Text style={{ fontSize: 13, color: C.muted }} numberOfLines={1}>
                  {sample}
                </Text>
              </View>
              {isDone ? (
                <View style={styles.doneDot}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13 }}>✓</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.wod}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[styles.smallCaps, { color: C.tealDark }]}>{t('wordOfDay', uiLang)}</Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: C.ink }}>{wod.kn}</Text>
          <Text style={{ fontSize: 14, color: C.ink2 }}>
            {wod.roman} · {label(wod, profile?.langs ?? ['en'])}
          </Text>
        </View>
        <SpeakButton text={wod.kn} bg={C.teal} fg={C.ink} />
      </View>

      <Pressable accessibilityRole="button" onPress={onOpenSpeak} style={styles.speakCard}>
        <Text style={{ fontSize: 26 }}>🎙️</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '800', fontSize: 16, color: C.ink }}>{t('speakPractice', uiLang)}</Text>
          <Text style={{ fontSize: 13, color: '#5C1F0F' }}>ನಿಮ್ಮ ಹೆಸರು ಏನು? · nimma hesaru ēnu?</Text>
        </View>
        <Text style={{ fontSize: 22, color: C.ink }}>›</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, gap: 14, backgroundColor: C.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  pathChip: { flexShrink: 1, height: 40, paddingHorizontal: 14, borderRadius: 999, backgroundColor: C.violetTint, justifyContent: 'center' },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 40, paddingHorizontal: 12, borderRadius: 999, backgroundColor: C.coralTint },
  hero: { backgroundColor: C.violet, borderRadius: 24, padding: 18, flexDirection: 'row', gap: 14, alignItems: 'center', overflow: 'hidden' },
  blob: { position: 'absolute', borderRadius: 999 },
  ring: { width: 74, height: 74, borderRadius: 37, backgroundColor: 'rgba(255,255,255,0.22)', overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  ringFill: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.gold },
  ringInner: { position: 'absolute', top: 8, left: 8, width: 58, height: 58, borderRadius: 29, backgroundColor: C.violet, alignItems: 'center', justifyContent: 'center' },
  heroBtn: { alignSelf: 'flex-start', marginTop: 4, height: 44, paddingHorizontal: 18, borderRadius: 14, backgroundColor: C.gold, justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: '#C98A0A' },
  unit: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: 18, padding: 10, borderWidth: 2, borderColor: 'transparent' },
  unitTile: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  doneDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  wod: { backgroundColor: C.tealTint, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  smallCaps: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  speakCard: { backgroundColor: C.coralTint, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
});
