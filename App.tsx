import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/store';
import { C } from './src/theme';
import { t, type Key } from './src/i18n';
import Onboarding from './src/screens/Onboarding';
import Home from './src/screens/Home';
import Lesson from './src/screens/Lesson';
import Numbers from './src/screens/Numbers';
import Script from './src/screens/Script';
import Phrasebook from './src/screens/Phrasebook';
import Progress from './src/screens/Progress';
import Speak from './src/screens/Speak';

type Tab = 'home' | 'script' | 'numbers' | 'phrases' | 'progress';
type Overlay = { kind: 'lesson'; unitId: string } | { kind: 'speak' } | null;

const TABS: { id: Tab; key: Key; glyph: string; color: string; tint: string }[] = [
  { id: 'home', key: 'learn', glyph: '⌂', color: C.violet, tint: C.violetTint },
  { id: 'script', key: 'script', glyph: 'ಅ', color: C.magenta, tint: C.magentaTint },
  { id: 'numbers', key: 'numbers', glyph: '೧೨', color: '#8A5300', tint: C.marigoldTint },
  { id: 'phrases', key: 'phrases', glyph: '❝', color: C.tealDark, tint: C.tealTint },
  { id: 'progress', key: 'progress', glyph: '▮', color: C.blueDark, tint: C.blueTint },
];

function Root() {
  const { ready, profile, uiLang, changingPath } = useStore();
  const [tab, setTab] = useState<Tab>('home');
  const [overlay, setOverlay] = useState<Overlay>(null);

  // Android back button closes a lesson / speak screen, then returns to Home.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (overlay) {
        setOverlay(null);
        return true;
      }
      if (tab !== 'home') {
        setTab('home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [overlay, tab]);

  if (!ready) {
    return (
      <View style={[styles.fill, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={C.magenta} size="large" />
      </View>
    );
  }

  if (!profile || changingPath) return <Onboarding />;

  if (overlay?.kind === 'lesson') return <Lesson unitId={overlay.unitId} onClose={() => setOverlay(null)} />;
  if (overlay?.kind === 'speak') return <Speak onBack={() => setOverlay(null)} />;

  const startLesson = (unitId: string) => setOverlay({ kind: 'lesson', unitId });

  return (
    <View style={styles.fill}>
      <View style={styles.fill}>
        {tab === 'home' && <Home onStartLesson={startLesson} onOpenSpeak={() => setOverlay({ kind: 'speak' })} />}
        {tab === 'script' && <Script />}
        {tab === 'numbers' && <Numbers onStartLesson={startLesson} />}
        {tab === 'phrases' && <Phrasebook />}
        {tab === 'progress' && <Progress />}
      </View>
      <View style={styles.tabbar} accessibilityRole="tablist">
        {TABS.map((tb) => {
          const on = tab === tb.id;
          return (
            <Pressable
              key={tb.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setTab(tb.id)}
              style={styles.tabItem}
            >
              <View style={[styles.tabIcon, on && { backgroundColor: tb.tint }]}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: on ? tb.color : C.muted }}>{tb.glyph}</Text>
              </View>
              <Text style={{ fontSize: 11, fontWeight: on ? '800' : '600', color: on ? tb.color : C.muted }} numberOfLines={1}>
                {t(tb.key, uiLang)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <SafeAreaView style={[styles.fill, Platform.OS === 'web' && styles.webOuter]} edges={['top', 'bottom', 'left', 'right']}>
          <StatusBar style="dark" />
          <View style={[styles.fill, Platform.OS === 'web' && styles.webColumn]}>
            <Root />
          </View>
        </SafeAreaView>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.bg },
  // On a computer, show the app as a centred column instead of stretching across the screen.
  webOuter: { backgroundColor: '#F1E7FB', alignItems: 'center' },
  webColumn: { width: '100%', maxWidth: 560, borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#E4DAF5' },
  tabbar: { flexDirection: 'row', backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 6, paddingBottom: 8 },
  tabItem: { flex: 1, alignItems: 'center', gap: 2, minHeight: 52, justifyContent: 'center' },
  tabIcon: { width: 48, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
