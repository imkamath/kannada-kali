import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { C, pal } from '../theme';
import { BigButton, SpeakButton } from '../components/ui';
import Celebration from '../components/Celebration';
import { useStore, type ProgressState } from '../store';
import { UNITS, toKannadaDigits, type Item, type Lang } from '../data/content';
import { t } from '../i18n';
import { say } from '../speech';

type QType = 'choose' | 'listen';
interface Question {
  type: QType;
  answer: Item;
  options: Item[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(items: Item[]): Question[] {
  const picked = shuffle(items).slice(0, Math.min(8, items.length));
  return picked.map((answer, i) => {
    const distractors = shuffle(items.filter((x) => x !== answer)).slice(0, 3);
    return { type: i % 3 === 2 ? 'listen' : 'choose', answer, options: shuffle([answer, ...distractors]) };
  });
}

export default function Lesson({ unitId, onClose }: { unitId: string; onClose: () => void }) {
  const { uiLang, uiLang2, promptLangs, targetLangs, label, recordLesson, profile } = useStore();
  const unit = UNITS.find((u) => u.id === unitId) ?? UNITS[0];
  const questions = useMemo(() => buildQuestions(unit.items), [unit]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Item | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState<{ xp: number; progress: ProgressState } | null>(null);

  const q = questions[index];
  const teach = profile?.direction === 'teach';
  const kannadaSide: Lang[] = ['kn'];
  // Learn Kannada: prompt in learner languages, answer in Kannada. Teach: reverse.
  const promptSide: Lang[] = teach ? kannadaSide : promptLangs;
  const answerSide: Lang[] = teach ? targetLangs : kannadaSide;
  const audioLang: Lang = teach ? targetLangs[0] : 'kn';
  const audioText = (it: Item) => (teach ? it[targetLangs[0]] : it.kn);

  // Auto-play audio for listening questions.
  useEffect(() => {
    if (q?.type === 'listen') say(audioText(q.answer), audioLang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const isCorrect = checked && picked === q.answer;
  const heading = (k: Parameters<typeof t>[0]) => t(k, uiLang) + (uiLang2 ? ` · ${t(k, uiLang2)}` : '');

  const check = () => {
    if (!picked) return;
    setChecked(true);
    if (picked === q.answer) setCorrectCount((c) => c + 1);
    say(audioText(q.answer), audioLang);
  };

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setPicked(null);
      setChecked(false);
    } else {
      const xp = 10 + correctCount * 2;
      const progress = recordLesson({ unitId: unit.id, xpEarned: xp, words: questions.map((x) => x.answer.kn) });
      setResult({ xp, progress });
    }
  };

  const optionText = (it: Item, side: Lang[]) => {
    const base = label(it, side);
    return side.includes('kn') && it.digit !== undefined ? `${toKannadaDigits(it.digit)}  ${base}` : base;
  };

  const promptMain = q.type === 'listen' ? null : label(q.answer, promptSide);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close lesson" onPress={onClose} hitSlop={10} style={styles.close}>
          <Text style={{ fontSize: 22, color: C.muted, fontWeight: '700' }}>✕</Text>
        </Pressable>
        <View style={styles.bar}>
          {questions.map((_, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: i < index + (checked ? 1 : 0) ? pal(i)[0] : 'transparent' }} />
          ))}
        </View>
        <Text style={{ fontWeight: '800', color: C.muted }}>
          {index + 1}/{questions.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '800', color: C.violet }}>
            {q.type === 'listen' ? heading('listenChoose') : teach ? heading('chooseMeaning') : heading('chooseKannada')}
          </Text>
          <Text style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{unit.title[uiLang]}</Text>
        </View>

        <View style={styles.prompt}>
          <SpeakButton
            text={q.type === 'listen' ? audioText(q.answer) : teach ? q.answer.kn : q.answer[promptLangs[0]]}
            lang={q.type === 'listen' ? audioLang : teach ? 'kn' : promptLangs[0]}
            size={52}
            bg={C.gold}
            fg={C.ink}
          />
          <View style={{ flex: 1 }}>
            {q.answer.digit !== undefined && q.type !== 'listen' ? (
              <Text style={{ fontSize: 40, fontWeight: '900', color: C.gold, lineHeight: 46 }}>{q.answer.digit}</Text>
            ) : null}
            {promptMain ? (
              <Text style={{ fontSize: promptMain.length > 24 ? 22 : 28, fontWeight: '800', color: '#FFFFFF' }}>{promptMain}</Text>
            ) : (
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF' }}>🔊 …</Text>
            )}
            {teach && q.type !== 'listen' ? <Text style={{ color: '#E2D8FB', fontSize: 14 }}>{q.answer.roman}</Text> : null}
          </View>
          {profile && profile.langs.length === 2 ? <Text style={styles.jointTag}>JOINT</Text> : null}
        </View>

        <View style={styles.grid}>
          {q.options.map((o, i) => {
            const [solid, tint] = pal(i);
            let bg = C.card;
            let border = solid;
            let bw = 2;
            if (picked === o) {
              bg = tint;
              bw = 3;
            }
            if (checked && o === q.answer) {
              bg = C.greenTint;
              border = C.green;
              bw = 3;
            }
            if (checked && picked === o && o !== q.answer) {
              bg = C.redTint;
              border = C.red;
            }
            const sideForOption = q.type === 'listen' ? (teach ? kannadaSide : promptLangs) : answerSide;
            return (
              <Pressable
                key={i}
                accessibilityRole="radio"
                accessibilityState={{ selected: picked === o }}
                disabled={checked}
                onPress={() => {
                  setPicked(o);
                  if (sideForOption.includes('kn')) say(o.kn, 'kn');
                }}
                style={[styles.option, { backgroundColor: bg, borderColor: border, borderWidth: bw }]}
              >
                <Text style={{ fontSize: sideForOption.includes('kn') ? 24 : 18, fontWeight: '800', color: C.ink, textAlign: 'center' }}>
                  {optionText(o, sideForOption)}
                </Text>
                {sideForOption.includes('kn') ? <Text style={{ fontSize: 13, color: C.ink2 }}>{o.roman}</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {checked ? (
        <View style={[styles.feedback, { backgroundColor: isCorrect ? C.greenTint : C.redTint }]}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: isCorrect ? C.greenDark : '#8A1C1C' }}>
            {isCorrect ? `ಸರಿ! ${t('correct', uiLang)}` : `${t('wrong', uiLang)} ${label(q.answer, answerSide)}`}
          </Text>
          <Text style={{ fontSize: 14, color: C.ink }}>
            {q.answer.kn} ({q.answer.roman}) = {label(q.answer, profile?.langs ?? ['en'])}
          </Text>
          <BigButton
            label={index + 1 < questions.length ? t('next', uiLang) : t('finish', uiLang)}
            onPress={next}
            color={isCorrect ? C.green : C.violet}
            shadow={isCorrect ? '#0F7A35' : C.violetDark}
            textColor={isCorrect ? '#10251A' : '#FFFFFF'}
          />
        </View>
      ) : (
        <View style={{ padding: 20, paddingTop: 8 }}>
          <BigButton label={t('check', uiLang)} onPress={check} disabled={!picked} />
        </View>
      )}

      {result ? (
        <Celebration
          unitTitle={unit.title[uiLang]}
          xp={result.xp}
          streak={result.progress.streak}
          accuracy={Math.round((correctCount / questions.length) * 100)}
          words={questions.slice(0, 6).map((x) => x.answer.kn)}
          onContinue={onClose}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 8 },
  close: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  bar: { flex: 1, height: 14, borderRadius: 999, backgroundColor: C.line, overflow: 'hidden', flexDirection: 'row' },
  prompt: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.violet, borderRadius: 22, padding: 16 },
  jointTag: { alignSelf: 'flex-start', fontSize: 10, fontWeight: '800', backgroundColor: '#FFFFFF', color: C.violet, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  option: { width: '47.5%', minHeight: 110, borderRadius: 20, borderBottomWidth: 5, alignItems: 'center', justifyContent: 'center', padding: 10, gap: 4 },
  feedback: { padding: 20, gap: 10, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
});
