import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BaseLang, Item, Lang } from './data/content';
import { syncConfigured } from './sync/config';
import { CODE_RE, fetchRemote, newSyncCode, normalizeCode, pushRemote } from './sync/remote';

export type Direction = 'learn' | 'teach'; // learn = learn Kannada; teach = Kannada speaker learns base language(s)

export interface Profile {
  langs: BaseLang[]; // 1 or 2 languages (2 = joint mode)
  direction: Direction;
}

// What screens read (derived from the saved state).
export interface ProgressState {
  xp: number;
  streak: number;
  lastActiveDay: string | null;
  completedUnits: string[];
  learnedWords: string[];
  dailyXp: Record<string, number>; // day -> XP from all devices
  lessonsDone: number;
}

// What is saved on the device and synced. Every field merges cleanly between devices.
interface Saved {
  v: 2;
  deviceId: string;
  profile: Profile | null;
  profileUpdatedAt: number;
  completedUnits: string[];
  learnedWords: string[];
  dailyXp: Record<string, Record<string, number>>; // deviceId -> day -> XP
  lessons: Record<string, number>; // deviceId -> lessons finished
  syncCode: string | null;
  lastSyncAt: number | null;
}

type SyncPayload = Pick<Saved, 'profile' | 'profileUpdatedAt' | 'completedUnits' | 'learnedWords' | 'dailyXp' | 'lessons'>;

const KEY_V2 = 'kannadakali:v2';
const KEY_V1 = 'kannadakali:v1';

const randomId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const emptySaved = (): Saved => ({
  v: 2,
  deviceId: randomId(),
  profile: null,
  profileUpdatedAt: 0,
  completedUnits: [],
  learnedWords: [],
  dailyXp: {},
  lessons: {},
  syncCode: null,
  lastSyncAt: null,
});

export const dayKey = (d: Date = new Date()) => {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

const union = (a: string[] = [], b: string[] = []) => Array.from(new Set([...a, ...b]));

function mergeSaved(local: Saved, remote: Partial<SyncPayload>): Saved {
  const dailyXp: Saved['dailyXp'] = JSON.parse(JSON.stringify(local.dailyXp));
  for (const [dev, days] of Object.entries(remote.dailyXp ?? {})) {
    dailyXp[dev] = dailyXp[dev] ?? {};
    for (const [day, xp] of Object.entries(days ?? {})) dailyXp[dev][day] = Math.max(dailyXp[dev][day] ?? 0, Number(xp) || 0);
  }
  const lessons = { ...local.lessons };
  for (const [dev, n] of Object.entries(remote.lessons ?? {})) lessons[dev] = Math.max(lessons[dev] ?? 0, Number(n) || 0);
  const remoteNewer = (remote.profileUpdatedAt ?? 0) > local.profileUpdatedAt && !!remote.profile;
  return {
    ...local,
    profile: remoteNewer ? remote.profile! : local.profile ?? remote.profile ?? null,
    profileUpdatedAt: Math.max(local.profileUpdatedAt, remote.profileUpdatedAt ?? 0),
    completedUnits: union(local.completedUnits, remote.completedUnits),
    learnedWords: union(local.learnedWords, remote.learnedWords),
    dailyXp,
    lessons,
  };
}

const payloadOf = (s: Saved): SyncPayload => ({
  profile: s.profile,
  profileUpdatedAt: s.profileUpdatedAt,
  completedUnits: s.completedUnits,
  learnedWords: s.learnedWords,
  dailyXp: s.dailyXp,
  lessons: s.lessons,
});

function derive(s: Saved): ProgressState {
  const totals: Record<string, number> = {};
  for (const days of Object.values(s.dailyXp)) for (const [day, xp] of Object.entries(days)) totals[day] = (totals[day] ?? 0) + xp;
  const xp = Object.values(totals).reduce((a, b) => a + b, 0);
  const active = new Set(Object.keys(totals).filter((d) => totals[d] > 0));
  const d = new Date();
  if (!active.has(dayKey(d))) d.setDate(d.getDate() - 1); // streak still alive if you learned yesterday
  let streak = 0;
  while (active.has(dayKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  const days = Array.from(active).sort();
  return {
    xp,
    streak,
    lastActiveDay: days.length ? days[days.length - 1] : null,
    completedUnits: s.completedUnits,
    learnedWords: s.learnedWords,
    dailyXp: totals,
    lessonsDone: Object.values(s.lessons).reduce((a, b) => a + b, 0),
  };
}

function migrateV1(raw: string): Saved {
  const s = emptySaved();
  try {
    const old = JSON.parse(raw);
    if (old.profile) {
      s.profile = old.profile;
      s.profileUpdatedAt = 1;
    }
    const p = old.progress ?? {};
    s.completedUnits = p.completedUnits ?? [];
    s.learnedWords = p.learnedWords ?? [];
    s.dailyXp = { [s.deviceId]: p.dailyXp ?? {} };
    s.lessons = { [s.deviceId]: p.lessonsDone ?? 0 };
  } catch {
    // ignore broken data
  }
  return s;
}

export interface LessonResult {
  unitId: string;
  xpEarned: number;
  words: string[];
}

export type SyncStatus = 'off' | 'syncing' | 'ok' | 'error';

interface Ctx {
  ready: boolean;
  profile: Profile | null;
  progress: ProgressState;
  setProfile: (p: Profile) => void;
  // "Change learning path": show the path picker again without losing anything.
  changingPath: boolean;
  resetProfile: () => void;
  cancelPathChange: () => void;
  recordLesson: (r: LessonResult) => ProgressState;
  // sync
  syncAvailable: boolean;
  syncCode: string | null;
  syncStatus: SyncStatus;
  syncError: string | null;
  lastSyncAt: number | null;
  createSyncCode: () => Promise<void>;
  linkSyncCode: (code: string) => Promise<{ ok: boolean; message?: string }>;
  unlinkSync: () => void;
  syncNow: () => Promise<void>;
  // derived helpers
  uiLang: Lang;
  uiLang2: Lang | null;
  promptLangs: Lang[];
  targetLangs: Lang[];
  label: (item: Item, langs: Lang[]) => string;
  pathName: string;
}

const StoreCtx = createContext<Ctx | null>(null);

export const LANG_NAME: Record<Lang, string> = { en: 'English', hi: 'हिंदी', mr: 'मराठी', kn: 'ಕನ್ನಡ' };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<Saved>(emptySaved);
  const [changingPath, setChangingPath] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('off');
  const [syncError, setSyncError] = useState<string | null>(null);
  const savedRef = useRef(saved);
  const syncing = useRef(false);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncAvailable = syncConfigured();

  const commit = useCallback((next: Saved) => {
    savedRef.current = next;
    setSaved(next);
    AsyncStorage.setItem(KEY_V2, JSON.stringify(next)).catch(() => {});
  }, []);

  const syncNow = useCallback(async () => {
    const cur = savedRef.current;
    if (!syncAvailable || !cur.syncCode || syncing.current) return;
    syncing.current = true;
    setSyncStatus('syncing');
    try {
      const code = cur.syncCode;
      const remote = await fetchRemote(code);
      let merged = savedRef.current;
      if (remote) merged = mergeSaved(merged, JSON.parse(remote.data || '{}'));
      const payload = JSON.stringify(payloadOf(merged));
      if (!remote || remote.data !== payload) await pushRemote(code, payload);
      commit({ ...merged, lastSyncAt: Date.now() });
      setSyncStatus('ok');
      setSyncError(null);
    } catch (e) {
      setSyncStatus('error');
      setSyncError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      syncing.current = false;
    }
  }, [commit, syncAvailable]);

  const scheduleSync = useCallback(() => {
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      syncNow();
    }, 1200);
  }, [syncNow]);

  // Load saved state (migrating the first version's format).
  useEffect(() => {
    (async () => {
      let s = emptySaved();
      try {
        const raw2 = await AsyncStorage.getItem(KEY_V2);
        if (raw2) s = { ...emptySaved(), ...JSON.parse(raw2) };
        else {
          const raw1 = await AsyncStorage.getItem(KEY_V1);
          if (raw1) s = migrateV1(raw1);
        }
      } catch {
        // start fresh if storage is unavailable
      }
      commit(s);
      setReady(true);
      if (s.syncCode) syncNow();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync when the app comes back to the foreground, and every minute while open.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') syncNow();
    });
    const timer = setInterval(() => syncNow(), 60000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, [syncNow]);

  const setProfile = useCallback(
    (p: Profile) => {
      commit({ ...savedRef.current, profile: p, profileUpdatedAt: Date.now() });
      setChangingPath(false);
      scheduleSync();
    },
    [commit, scheduleSync],
  );

  const recordLesson = useCallback(
    (r: LessonResult) => {
      const cur = savedRef.current;
      const today = dayKey();
      const mine = { ...(cur.dailyXp[cur.deviceId] ?? {}) };
      mine[today] = (mine[today] ?? 0) + r.xpEarned;
      const next: Saved = {
        ...cur,
        completedUnits: union(cur.completedUnits, [r.unitId]),
        learnedWords: union(cur.learnedWords, r.words),
        dailyXp: { ...cur.dailyXp, [cur.deviceId]: mine },
        lessons: { ...cur.lessons, [cur.deviceId]: (cur.lessons[cur.deviceId] ?? 0) + 1 },
      };
      commit(next);
      scheduleSync();
      return derive(next);
    },
    [commit, scheduleSync],
  );

  const createSyncCode = useCallback(async () => {
    commit({ ...savedRef.current, syncCode: newSyncCode() });
    await syncNow();
  }, [commit, syncNow]);

  const linkSyncCode = useCallback(
    async (input: string) => {
      const code = normalizeCode(input);
      if (!CODE_RE.test(code)) return { ok: false, message: 'Please check the code — it has 12 letters and numbers.' };
      try {
        const remote = await fetchRemote(code);
        if (!remote) return { ok: false, message: 'No progress found for this code.' };
        const merged = mergeSaved(savedRef.current, JSON.parse(remote.data || '{}'));
        commit({ ...merged, syncCode: code });
        setChangingPath(false);
        await syncNow();
        return { ok: true };
      } catch (e) {
        return { ok: false, message: e instanceof Error ? e.message : 'Could not reach the sync server.' };
      }
    },
    [commit, syncNow],
  );

  const unlinkSync = useCallback(() => {
    commit({ ...savedRef.current, syncCode: null, lastSyncAt: null });
    setSyncStatus('off');
    setSyncError(null);
  }, [commit]);

  const progress = useMemo(() => derive(saved), [saved]);
  const profile = saved.profile;

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
      changingPath,
      resetProfile: () => setChangingPath(true),
      cancelPathChange: () => setChangingPath(false),
      recordLesson,
      syncAvailable,
      syncCode: saved.syncCode,
      syncStatus: saved.syncCode ? syncStatus : 'off',
      syncError,
      lastSyncAt: saved.lastSyncAt,
      createSyncCode,
      linkSyncCode,
      unlinkSync,
      syncNow,
      uiLang,
      uiLang2,
      promptLangs,
      targetLangs,
      label,
      pathName,
    };
  }, [ready, profile, progress, setProfile, changingPath, recordLesson, syncAvailable, saved.syncCode, saved.lastSyncAt, syncStatus, syncError, createSyncCode, linkSyncCode, unlinkSync, syncNow]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const v = useContext(StoreCtx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}
