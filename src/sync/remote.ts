import { FIREBASE } from './config';

// Sync codes use 32 unambiguous characters (no I, O, 0, 1): 12 characters ≈ 60 bits, not guessable.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const CODE_RE = /^[A-HJ-NP-Z2-9]{12}$/;

export function newSyncCode(): string {
  let out = '';
  const bytes = new Uint8Array(12);
  const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } }).crypto;
  if (c?.getRandomValues) c.getRandomValues(bytes);
  else for (let i = 0; i < 12; i++) bytes[i] = Math.floor(Math.random() * 256);
  for (let i = 0; i < 12; i++) out += ALPHABET[bytes[i] % 32];
  return out;
}

// "abcd-efgh 2345" → "ABCDEFGH2345"
export const normalizeCode = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
export const formatCode = (c: string) => c.replace(/(.{4})(?=.)/g, '$1-');

const docUrl = (code: string) =>
  `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents/sync/${code}${FIREBASE.apiKey ? `?key=${FIREBASE.apiKey}` : ''}`;

export interface RemoteDoc {
  data: string;
  updatedAt: number;
}

// Returns null when the code has no saved progress yet.
export async function fetchRemote(code: string): Promise<RemoteDoc | null> {
  const res = await fetch(docUrl(code));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Sync read failed (${res.status})`);
  const json = await res.json();
  const f = json.fields ?? {};
  return { data: f.data?.stringValue ?? '{}', updatedAt: Number(f.updatedAt?.integerValue ?? 0) };
}

export async function pushRemote(code: string, data: string): Promise<void> {
  const body = {
    fields: {
      data: { stringValue: data },
      updatedAt: { integerValue: String(Date.now()) },
    },
  };
  const res = await fetch(docUrl(code), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Sync write failed (${res.status})`);
}
