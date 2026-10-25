import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { C } from '../theme';
import { say } from '../speech';
import type { Lang } from '../data/content';

export function BigButton({
  label,
  onPress,
  color = C.magenta,
  shadow = C.magentaDark,
  textColor = '#FFFFFF',
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  color?: string;
  shadow?: string;
  textColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.big,
        {
          backgroundColor: disabled ? '#E4DFEA' : color,
          borderBottomColor: disabled ? '#E4DFEA' : shadow,
          transform: [{ translateY: pressed ? 2 : 0 }],
        },
        style,
      ]}
    >
      <Text style={[styles.bigText, { color: disabled ? C.ink2 : textColor }]}>{label}</Text>
    </Pressable>
  );
}

export function SpeakButton({
  text,
  lang = 'kn',
  size = 44,
  bg = C.violetTint,
  fg = C.violet,
  slow,
}: {
  text: string;
  lang?: Lang;
  size?: number;
  bg?: string;
  fg?: string;
  slow?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Play ${text}`}
      onPress={() => say(text, lang, slow)}
      hitSlop={6}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: size * 0.3, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <SpeakerIcon color={fg} size={size * 0.45} />
    </Pressable>
  );
}

// "Play" triangle built from borders (no icon font needed).
export function SpeakerIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <View
      style={{
        width: 0,
        height: 0,
        marginLeft: size * 0.15,
        borderTopWidth: size * 0.45,
        borderBottomWidth: size * 0.45,
        borderLeftWidth: size * 0.75,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: color,
      }}
    />
  );
}

export function Chip({ label, bg, fg, style }: { label: string; bg: string; fg: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ backgroundColor: bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }, style]}>
      <Text style={{ color: fg, fontSize: 13, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}

export function SectionLabel({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.section, style]}>{children}</Text>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function TopBar({ title, subtitle, onBack, right }: { title: string; subtitle?: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <View style={styles.topbar}>
      {onBack ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} hitSlop={10} style={styles.back}>
          <Text style={{ fontSize: 26, color: C.ink, fontWeight: '700', marginTop: -3 }}>‹</Text>
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  big: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    paddingHorizontal: 18,
  },
  bigText: { fontSize: 17, fontWeight: '800' },
  section: { fontSize: 13, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', color: C.muted },
  card: { backgroundColor: C.card, borderRadius: 20, padding: 14 },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  back: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  title: { fontSize: 22, fontWeight: '800', color: C.ink },
  subtitle: { fontSize: 13, color: C.muted, marginTop: 1 },
});
