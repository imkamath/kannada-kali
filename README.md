# Kannada Kali · ಕನ್ನಡ ಕಲಿ

An Android app (built with Expo / React Native) for learning Kannada from English, Hindi or Marathi, in single or joint (two-language) mode, and for Kannada speakers learning those languages.

## What's inside

| Screen | What it does |
|---|---|
| Choose your path | Pick 1 or 2 known languages (English, हिंदी, मराठी). Picking two turns on **joint mode**. Choose to learn Kannada, or to learn the other language(s) from Kannada. |
| Home | Daily XP goal, streak, 8 units that unlock one by one, word of the day, speaking practice. |
| Lesson | 8 questions per unit: choose the Kannada word, or listen and choose. Audio plays through the phone's text-to-speech. |
| Celebration | Marigold flower, falling petals, garland, stars, XP, streak, accuracy, new words, share with family. |
| Numbers | 1–10, 11–20, tens to 1000, money and time, with Kannada digits (೧ ೨ ೩) and a number quiz. |
| Script | All Kannada vowels and consonants side by side with Devanagari and Roman sounds. Tap to hear. |
| Phrasebook | Auto-rickshaw, market, office and hospital phrases, both directions, with search. Works offline. |
| Speak | Listen and repeat with normal/slow audio and self-rating. |
| Progress | Streak, words learned, units done, weekly XP chart, flower badges, change path. |

Progress is saved on the phone. All course content lives in `src/data/content.ts`. **Please have a native speaker review the Kannada, Hindi and Marathi before publishing.**

## Run it on your phone (quickest)

1. Install **Node.js LTS** from https://nodejs.org.
2. Open a terminal in this folder and run:
   ```
   npm install
   npx expo start
   ```
3. Install **Expo Go** from the Play Store on your Android phone, then scan the QR code shown in the terminal (phone and computer on the same Wi-Fi).

For Kannada audio, the phone needs the Kannada voice: Settings → Text-to-speech → Google → Install voice data → ಕನ್ನಡ (Kannada). Do the same for Hindi / Marathi if needed.

## Build an installable APK

**Option A — in the cloud (no Android Studio needed):**
```
npm install -g eas-cli
eas login            (free Expo account)
eas build -p android --profile preview
```
When it finishes you get a link to download the `.apk` and install it on any Android phone.

**Option B — on this computer (needs Android Studio + JDK 17):**
```
npm install
npx expo prebuild -p android
cd android
gradlew.bat assembleRelease
```
The APK appears in `android/app/build/outputs/apk/release/`.

## Publish to the Play Store

```
eas build -p android --profile production     (makes an .aab)
eas submit -p android
```
You need a Google Play developer account. Change `android.package` in `app.json` (currently `com.kannadakali.app`) to your own before the first upload.

## Project layout

```
App.tsx                  tab bar + screen switching
src/data/content.ts      all words, numbers, phrases, letters
src/i18n.ts              app text in English, Hindi, Marathi, Kannada
src/store.tsx            learning path, XP, streak (saved on the phone)
src/screens/             Onboarding, Home, Lesson, Numbers, Script, Phrasebook, Speak, Progress
src/components/          shared buttons, Celebration popup
```

## Build the APK on GitHub (no setup needed on your computer)

Every push to `main` runs `.github/workflows/build-apk.yml`, which builds the APK on GitHub's servers (about 15–25 minutes) and publishes it under **Releases** as `KannadaKali.apk`. You can also start a build by hand from the **Actions** tab → *Build Android APK* → *Run workflow*.

The APK is signed with a debug key, which is fine for installing and testing on phones. For the Play Store, build with `eas build -p android --profile production` or add your own release keystore.
