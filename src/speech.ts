import * as Speech from 'expo-speech';
import type { Lang } from './data/content';

const VOICE_LANG: Record<Lang, string> = {
  kn: 'kn-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  en: 'en-IN',
};

// Speaks text with the phone's text-to-speech engine.
// Kannada needs the Kannada voice in Google Text-to-speech (Settings → Text-to-speech).
export function say(text: string, lang: Lang = 'kn', slow = false) {
  const clean = text.replace(/…/g, ' ').trim();
  if (!clean) return;
  Speech.stop();
  Speech.speak(clean, { language: VOICE_LANG[lang], rate: slow ? 0.6 : 0.9 });
}
