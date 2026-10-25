import React, { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { C } from '../theme';
import { useStore } from '../store';
import { formatCode } from '../sync/remote';
import { confirmAction } from './dialog';
import { t } from '../i18n';

const ago = (ts: number | null) => {
  if (!ts) return 'not yet';
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  return `${Math.round(s / 3600)} h ago`;
};

// Shows the sync code, or lets the learner create one / enter one from another device.
export function SyncCard({ compact = false }: { compact?: boolean }) {
  const { syncAvailable, syncCode, syncStatus, syncError, lastSyncAt, createSyncCode, linkSyncCode, unlinkSync, syncNow, uiLang } = useStore();
  const [entering, setEntering] = useState(compact);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!syncAvailable) return null;

  const otherDevice = Platform.OS === 'web' ? 'phone app' : 'computer (web app)';

  if (syncCode) {
    return (
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.title}>Sync · {t('progress', uiLang)}</Text>
          <Text style={[styles.badge, syncStatus === 'error' ? styles.badgeErr : styles.badgeOk]}>
            {syncStatus === 'syncing' ? 'Syncing…' : syncStatus === 'error' ? 'Offline' : `Synced ${ago(lastSyncAt)}`}
          </Text>
        </View>
        <Text style={styles.help}>Enter this code in the Kannada Kali {otherDevice} to continue with the same progress:</Text>
        <Text selectable style={styles.code} accessibilityLabel={`Sync code ${syncCode.split('').join(' ')}`}>
          {formatCode(syncCode)}
        </Text>
        {syncError && syncStatus === 'error' ? <Text style={styles.err}>{syncError}. It will retry automatically.</Text> : null}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable accessibilityRole="button" onPress={syncNow} style={[styles.btn, { backgroundColor: C.violet }]}>
            <Text style={styles.btnText}>Sync now</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => Share.share({ message: `My Kannada Kali sync code: ${formatCode(syncCode)}` }).catch(() => {})}
            style={[styles.btn, { backgroundColor: C.violetTint }]}
          >
            <Text style={[styles.btnText, { color: C.violet }]}>Share code</Text>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            confirmAction('Stop syncing on this device?', 'Your progress stays here, but it will no longer update with your other devices.', unlinkSync, 'Stop syncing')
          }
          style={{ alignSelf: 'center', padding: 6 }}
        >
          <Text style={{ color: C.muted, fontWeight: '700', fontSize: 13 }}>Stop syncing on this device</Text>
        </Pressable>
      </View>
    );
  }

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    const r = await linkSyncCode(input);
    setBusy(false);
    if (!r.ok) setMsg(r.message ?? 'Could not link.');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{compact ? 'Already learning on another device?' : 'Sync phone and computer'}</Text>
      {!compact ? (
        <Text style={styles.help}>Learn on your phone and on the computer with the same streak, XP and units.</Text>
      ) : (
        <Text style={styles.help}>Enter the sync code shown in Progress on your other device.</Text>
      )}
      {entering ? (
        <>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="XXXX-XXXX-XXXX"
            placeholderTextColor="#9C97B0"
            autoCapitalize="characters"
            autoCorrect={false}
            accessibilityLabel="Sync code"
            style={styles.input}
            onSubmitEditing={submit}
          />
          {msg ? <Text style={styles.err}>{msg}</Text> : null}
          <Pressable accessibilityRole="button" disabled={busy} onPress={submit} style={[styles.btn, { backgroundColor: C.magenta, flex: 0 }]}>
            {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>Link this device</Text>}
          </Pressable>
        </>
      ) : null}
      {!compact ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={async () => {
              setBusy(true);
              await createSyncCode();
              setBusy(false);
            }}
            style={[styles.btn, { backgroundColor: C.violet }]}
          >
            <Text style={styles.btnText}>Get a sync code</Text>
          </Pressable>
          {!entering ? (
            <Pressable accessibilityRole="button" onPress={() => setEntering(true)} style={[styles.btn, { backgroundColor: C.violetTint }]}>
              <Text style={[styles.btnText, { color: C.violet }]}>I have a code</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: 20, padding: 14, gap: 10, borderWidth: 2, borderColor: C.violetTint },
  title: { fontSize: 16, fontWeight: '800', color: C.ink },
  help: { fontSize: 13, color: C.ink2, lineHeight: 19 },
  code: { fontSize: 26, fontWeight: '900', letterSpacing: 2, color: C.violet, textAlign: 'center', backgroundColor: C.violetTint, borderRadius: 14, paddingVertical: 10 },
  badge: { fontSize: 12, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  badgeOk: { backgroundColor: C.greenTint, color: C.greenDark },
  badgeErr: { backgroundColor: C.marigoldTint, color: '#8A5300' },
  err: { color: C.red, fontSize: 13, fontWeight: '600' },
  input: { height: 50, borderRadius: 14, borderWidth: 2, borderColor: C.line, backgroundColor: '#FFFFFF', paddingHorizontal: 14, fontSize: 20, fontWeight: '800', letterSpacing: 2, color: C.ink, textAlign: 'center' },
  btn: { flex: 1, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  btnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
