import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { C, pal } from '../theme';
import { SpeakButton, TopBar } from '../components/ui';
import { useStore } from '../store';
import { PHRASES, type Lang } from '../data/content';
import { t } from '../i18n';

export default function Phrasebook() {
  const { uiLang, profile, label } = useStore();
  const [cat, setCat] = useState(PHRASES[0].id);
  const [q, setQ] = useState('');
  const [reverse, setReverse] = useState(profile?.direction === 'teach');
  const langs: Lang[] = profile?.langs ?? ['en'];
  const short: Record<Lang, string> = { en: 'EN', hi: 'हिं', mr: 'म', kn: 'ಕನ್ನಡ' };
  const known = langs.map((l) => short[l]).join(' + ');

  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query) {
      return PHRASES.flatMap((p) => p.items).filter((it) =>
        [it.en, it.hi, it.mr, it.kn, it.roman].some((s) => s.toLowerCase().includes(query)),
      );
    }
    return PHRASES.find((p) => p.id === cat)!.items;
  }, [cat, q]);

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <TopBar title={t('phrases', uiLang)} right={<Text style={styles.offline}>✓ Offline</Text>} />

      <View style={styles.toggle}>
        {[false, true].map((rev) => {
          const on = reverse === rev;
          return (
            <Pressable
              key={String(rev)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => setReverse(rev)}
              style={[styles.toggleBtn, on && { backgroundColor: C.violet }]}
            >
              <Text style={{ fontWeight: '800', fontSize: 13, color: on ? '#FFFFFF' : '#43208F' }}>
                {rev ? `ಕನ್ನಡ → ${known}` : `${known} → ಕನ್ನಡ`}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={t('search', uiLang)}
        placeholderTextColor={C.muted}
        accessibilityLabel={t('search', uiLang)}
        style={styles.search}
      />

      {!q ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {PHRASES.map((p, i) => {
            const on = p.id === cat;
            const [solid, tint, onSolid, onTint] = pal(i + 1);
            return (
              <Pressable
                key={p.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => setCat(p.id)}
                style={[styles.cat, { backgroundColor: on ? solid : tint }]}
              >
                <Text style={{ fontWeight: '800', fontSize: 13, color: on ? onSolid : onTint }}>{p.title[uiLang]}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      <View style={{ gap: 8 }}>
        {items.map((it, i) => {
          const [solid, tint, onSolid, onTint] = pal(i);
          return (
            <View key={it.kn + i} style={styles.row}>
              <View style={[styles.num, { backgroundColor: solid }]}>
                <Text style={{ color: onSolid, fontWeight: '800' }}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                {reverse ? (
                  <>
                    <Text style={styles.small}>{it.kn}</Text>
                    <Text style={styles.main}>{label(it, langs)}</Text>
                    <Text style={styles.small}>{it.roman}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.small}>{label(it, langs)}</Text>
                    <Text style={styles.main}>{it.kn}</Text>
                    <Text style={styles.small}>{it.roman}</Text>
                  </>
                )}
              </View>
              <SpeakButton text={reverse ? it[langs[0]] : it.kn} lang={reverse ? langs[0] : 'kn'} bg={tint} fg={onTint} />
            </View>
          );
        })}
        {items.length === 0 ? <Text style={{ color: C.muted, textAlign: 'center', padding: 20 }}>—</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, gap: 12, backgroundColor: C.bg },
  offline: { fontSize: 12, fontWeight: '800', color: C.greenDark, backgroundColor: C.greenTint, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, overflow: 'hidden' },
  toggle: { flexDirection: 'row', backgroundColor: C.violetTint, borderRadius: 14, padding: 4, gap: 4 },
  toggleBtn: { flex: 1, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  search: { height: 48, borderRadius: 14, borderWidth: 2, borderColor: C.line, backgroundColor: C.card, paddingHorizontal: 14, fontSize: 15, color: C.ink },
  cat: { height: 38, paddingHorizontal: 14, borderRadius: 999, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: 18, padding: 10 },
  num: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  small: { fontSize: 12, color: C.muted },
  main: { fontSize: 20, fontWeight: '800', color: C.ink },
});
