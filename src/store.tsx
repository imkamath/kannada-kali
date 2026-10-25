import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BaseLang, Item, Lang } from './data/content';

export type Direction = 'learn' | 'teach'; // learn = learn Kannada; teach = Kannada speaker learns base language(s)

export interface Profile {
  langs: BaseLang[]; // 1 or 2 languages (2 = joint mode)
  direction: Direction;
}

export interface ProgressState {
  xp: number;
  streak: number;
  lastActiveDay: string | null; // YYYY-MM-DD
  completedUnits: string[];
  learnedWords: string[]; // Kannada strings
  dailyXp: Record<string, number>;
  lessonsDone: number;
}

const EMPTY: ProgressState = {
  xp: 0,
  streak: 0,
  lastActiveDay: null,
  completedUnits: [],
  learnedWords: [],
  dailyXp: {},
  lessonsDone: 0,
};

const KEY = 'kannadakali:v1';

export const dayKey = (d: Date = new Date()) => {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

const daysBetween = (a: string, b: string) => {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86400000);
};

export interface LessonResult {
  unitId: string;
  xpEarned: number;
  words: string[];
}

interface Ctx {
  ready: boolean;
  profile: Profile | null;
  progress: ProgressState;
  setProfile: (p: Profile) => void;
  resetProfile: () => void;
  recordLesson: (r: LessonResult) => ProgressState;
  // derived helpers
  uiLang: Lang; // main language for app text
  uiLang2: Lang | null; // second language shown in joint mode
  promptLangs: Lang[]; // languages the learner reads prompts in
  targetLangs: Lang[]; // languages being learned
  label: (item: Item, langs: Lang[]) => string;
  pathName: string;
}

const StoreCtx = createContext<Ctx | null>(null);

const LANG_NAME: Record<Lang, string> = { en: 'English', hi: 'हिंदी', mr: 'मराठी', kn: 'ಕನ್ನಡ' };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<ProgressState>(EMPTY);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.profile) setProfileState(saved.profile);
          if (saved.progress) setProgress({ ...EMPTY, ...saved.progress });
        }
      } catch {
        // start fresh if storage is unavailable
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback((p: Profile | null, pr: ProgressState) => {
    AsyncStorage.setItem(KEY, JSON.stringify({ profile: p, progress: pr })).catch(() => {});
  }, []);

  const setProfile = useCallback(
    (p: Profile) => {
      setProfileState(p);
      persist(p, progress);
    },
    [persist, progress],
  );

  const resetProfile = useCallback(() => {
    setProfileState(null);
    persist(null, progress);
  }, [persist, progress]);

  const recordLesson = useCallback(
    (r: LessonResult) => {
      const today = dayKey();
      let streak = progress.streak;
      if (progress.lastActiveDay !== today) {
        const gap = progress.lastActiveDay ? daysBetween(progress.lastActiveDay, today) : 999;
        streak = gap === 1 ? streak + 1 : 1;
      }
      const next: ProgressState = {
        xp: progress.xp + r.xpEarned,
        streak,
        lastActiveDay: today,
        completedUnits: progress.completedUnits.includes(r.unitId)
          ? progress.completedUnits
          : [...progress.completedUnits, r.unitId],
        learnedWords: Array.from(new Set([...progress.learnedWords, ...r.words])),
        dailyXp: { ...progress.dailyXp, [today]: (progress.dailyXp[today] ?? 0) + r.xpEarned },
        lessonsDone: progress.lessonsDone + 1,
      };
      setProgress(next);
      persist(profile, next);
      return next;
    },
    [progress, profile, persist],
  );

  const value = useMemo<Ctx>(() => {
    const langs: Lang[] = profile?.langs ?? ['en'];
    const teach = profile?.direction === 'teach';
    const uiLang: Lang = teach ? 'kn' : langs.includes('en') && langs.length === 1 ? 'en' : langs.find((l) => l !== 'en') ?? 'en';
    const uiLang2: Lang | null = teach ? null : langs.length === 2 ? (langs.find((l) => l !== uiLang) ?? null) : null;
    const promptLangs: Lang[] = teach ? ['kn'] : langs;
    const targetLangs: Lang[] = teach ? langs : ['kn'];
    const label = (item: Item, ls: Lang[]) => ls.map((l) => item[l]).join(' · ');
    const pathName = teach
      ? `ಕನ್ನಡ → ${langs.map((l) => LANG_NAME[l]).join(' + ')}`
      : `${langs.map((l) => LANG_NAME[l]).join(' + ')} → ಕನ್ನಡ`;
    return {
      ready,
      profile,
      progress,
      setProfile,
      resetProfile,
      recordLesson,
      uiLang,
      uiLang2,
      promptLangs,
      targetLangs,
      label,
      pathName,
    };
  }, [ready, profile, progress, setProfile, resetProfile, recordLesson]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const v = useContext(StoreCtx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}

export { LANG_NAME };
