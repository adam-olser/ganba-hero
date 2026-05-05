import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading2, Heading3, Caption } from '@/components/shared';
import { colors, spacing, layout, borderRadius } from '@/theme';
import { speakJapanese } from '@/services/tts';
import type { StudyScreenProps } from '@/types';

type KanaType = 'hiragana' | 'katakana';
type ScreenView = 'chart' | 'quiz';
type QuizScope = 'basic' | 'dakuten' | 'combos' | 'all';

interface KanaItem { char: string; romaji: string }
interface QuizState {
  queue: KanaItem[];
  index: number;
  options: string[]; // 4 romaji choices
  selected: string | null;
  correct: number;
  incorrect: number;
  done: boolean;
  // per-char accuracy for weak-character highlight
  accuracy: Map<string, { correct: number; total: number }>;
}

function flattenKanaRows(rows: KanaRow[]): KanaItem[] {
  return rows.flatMap(r => r.kana).filter(k => k.char !== '');
}

function buildQuizQueue(items: KanaItem[]): KanaItem[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function buildOptions(correct: KanaItem, pool: KanaItem[]): string[] {
  const distractors = pool
    .filter(k => k.romaji !== correct.romaji)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(k => k.romaji);
  return [correct.romaji, ...distractors].sort(() => Math.random() - 0.5);
}

interface KanaRow {
  consonant: string;
  kana: { char: string; romaji: string }[];
}

const HIRAGANA_BASIC: KanaRow[] = [
  { consonant: '', kana: [{ char: 'あ', romaji: 'a' }, { char: 'い', romaji: 'i' }, { char: 'う', romaji: 'u' }, { char: 'え', romaji: 'e' }, { char: 'お', romaji: 'o' }] },
  { consonant: 'k', kana: [{ char: 'か', romaji: 'ka' }, { char: 'き', romaji: 'ki' }, { char: 'く', romaji: 'ku' }, { char: 'け', romaji: 'ke' }, { char: 'こ', romaji: 'ko' }] },
  { consonant: 's', kana: [{ char: 'さ', romaji: 'sa' }, { char: 'し', romaji: 'shi' }, { char: 'す', romaji: 'su' }, { char: 'せ', romaji: 'se' }, { char: 'そ', romaji: 'so' }] },
  { consonant: 't', kana: [{ char: 'た', romaji: 'ta' }, { char: 'ち', romaji: 'chi' }, { char: 'つ', romaji: 'tsu' }, { char: 'て', romaji: 'te' }, { char: 'と', romaji: 'to' }] },
  { consonant: 'n', kana: [{ char: 'な', romaji: 'na' }, { char: 'に', romaji: 'ni' }, { char: 'ぬ', romaji: 'nu' }, { char: 'ね', romaji: 'ne' }, { char: 'の', romaji: 'no' }] },
  { consonant: 'h', kana: [{ char: 'は', romaji: 'ha' }, { char: 'ひ', romaji: 'hi' }, { char: 'ふ', romaji: 'fu' }, { char: 'へ', romaji: 'he' }, { char: 'ほ', romaji: 'ho' }] },
  { consonant: 'm', kana: [{ char: 'ま', romaji: 'ma' }, { char: 'み', romaji: 'mi' }, { char: 'む', romaji: 'mu' }, { char: 'め', romaji: 'me' }, { char: 'も', romaji: 'mo' }] },
  { consonant: 'y', kana: [{ char: 'や', romaji: 'ya' }, { char: '', romaji: '' }, { char: 'ゆ', romaji: 'yu' }, { char: '', romaji: '' }, { char: 'よ', romaji: 'yo' }] },
  { consonant: 'r', kana: [{ char: 'ら', romaji: 'ra' }, { char: 'り', romaji: 'ri' }, { char: 'る', romaji: 'ru' }, { char: 'れ', romaji: 're' }, { char: 'ろ', romaji: 'ro' }] },
  { consonant: 'w', kana: [{ char: 'わ', romaji: 'wa' }, { char: '', romaji: '' }, { char: '', romaji: '' }, { char: '', romaji: '' }, { char: 'を', romaji: 'wo' }] },
  { consonant: 'ん', kana: [{ char: 'ん', romaji: 'n' }, { char: '', romaji: '' }, { char: '', romaji: '' }, { char: '', romaji: '' }, { char: '', romaji: '' }] },
];

const HIRAGANA_DAKUTEN: KanaRow[] = [
  { consonant: 'g', kana: [{ char: 'が', romaji: 'ga' }, { char: 'ぎ', romaji: 'gi' }, { char: 'ぐ', romaji: 'gu' }, { char: 'げ', romaji: 'ge' }, { char: 'ご', romaji: 'go' }] },
  { consonant: 'z', kana: [{ char: 'ざ', romaji: 'za' }, { char: 'じ', romaji: 'ji' }, { char: 'ず', romaji: 'zu' }, { char: 'ぜ', romaji: 'ze' }, { char: 'ぞ', romaji: 'zo' }] },
  { consonant: 'd', kana: [{ char: 'だ', romaji: 'da' }, { char: 'ぢ', romaji: 'ji' }, { char: 'づ', romaji: 'zu' }, { char: 'で', romaji: 'de' }, { char: 'ど', romaji: 'do' }] },
  { consonant: 'b', kana: [{ char: 'ば', romaji: 'ba' }, { char: 'び', romaji: 'bi' }, { char: 'ぶ', romaji: 'bu' }, { char: 'べ', romaji: 'be' }, { char: 'ぼ', romaji: 'bo' }] },
  { consonant: 'p', kana: [{ char: 'ぱ', romaji: 'pa' }, { char: 'ぴ', romaji: 'pi' }, { char: 'ぷ', romaji: 'pu' }, { char: 'ぺ', romaji: 'pe' }, { char: 'ぽ', romaji: 'po' }] },
];

// Combo kana: 3 columns (ya / yu / yo)
interface ComboRow {
  base: string;
  combos: { char: string; romaji: string }[];
}

const HIRAGANA_COMBOS: ComboRow[] = [
  { base: 'き', combos: [{ char: 'きゃ', romaji: 'kya' }, { char: 'きゅ', romaji: 'kyu' }, { char: 'きょ', romaji: 'kyo' }] },
  { base: 'し', combos: [{ char: 'しゃ', romaji: 'sha' }, { char: 'しゅ', romaji: 'shu' }, { char: 'しょ', romaji: 'sho' }] },
  { base: 'ち', combos: [{ char: 'ちゃ', romaji: 'cha' }, { char: 'ちゅ', romaji: 'chu' }, { char: 'ちょ', romaji: 'cho' }] },
  { base: 'に', combos: [{ char: 'にゃ', romaji: 'nya' }, { char: 'にゅ', romaji: 'nyu' }, { char: 'にょ', romaji: 'nyo' }] },
  { base: 'ひ', combos: [{ char: 'ひゃ', romaji: 'hya' }, { char: 'ひゅ', romaji: 'hyu' }, { char: 'ひょ', romaji: 'hyo' }] },
  { base: 'み', combos: [{ char: 'みゃ', romaji: 'mya' }, { char: 'みゅ', romaji: 'myu' }, { char: 'みょ', romaji: 'myo' }] },
  { base: 'り', combos: [{ char: 'りゃ', romaji: 'rya' }, { char: 'りゅ', romaji: 'ryu' }, { char: 'りょ', romaji: 'ryo' }] },
  { base: 'ぎ', combos: [{ char: 'ぎゃ', romaji: 'gya' }, { char: 'ぎゅ', romaji: 'gyu' }, { char: 'ぎょ', romaji: 'gyo' }] },
  { base: 'じ', combos: [{ char: 'じゃ', romaji: 'ja' }, { char: 'じゅ', romaji: 'ju' }, { char: 'じょ', romaji: 'jo' }] },
  { base: 'び', combos: [{ char: 'びゃ', romaji: 'bya' }, { char: 'びゅ', romaji: 'byu' }, { char: 'びょ', romaji: 'byo' }] },
  { base: 'ぴ', combos: [{ char: 'ぴゃ', romaji: 'pya' }, { char: 'ぴゅ', romaji: 'pyu' }, { char: 'ぴょ', romaji: 'pyo' }] },
];

const KATAKANA_BASIC: KanaRow[] = [
  { consonant: '', kana: [{ char: 'ア', romaji: 'a' }, { char: 'イ', romaji: 'i' }, { char: 'ウ', romaji: 'u' }, { char: 'エ', romaji: 'e' }, { char: 'オ', romaji: 'o' }] },
  { consonant: 'k', kana: [{ char: 'カ', romaji: 'ka' }, { char: 'キ', romaji: 'ki' }, { char: 'ク', romaji: 'ku' }, { char: 'ケ', romaji: 'ke' }, { char: 'コ', romaji: 'ko' }] },
  { consonant: 's', kana: [{ char: 'サ', romaji: 'sa' }, { char: 'シ', romaji: 'shi' }, { char: 'ス', romaji: 'su' }, { char: 'セ', romaji: 'se' }, { char: 'ソ', romaji: 'so' }] },
  { consonant: 't', kana: [{ char: 'タ', romaji: 'ta' }, { char: 'チ', romaji: 'chi' }, { char: 'ツ', romaji: 'tsu' }, { char: 'テ', romaji: 'te' }, { char: 'ト', romaji: 'to' }] },
  { consonant: 'n', kana: [{ char: 'ナ', romaji: 'na' }, { char: 'ニ', romaji: 'ni' }, { char: 'ヌ', romaji: 'nu' }, { char: 'ネ', romaji: 'ne' }, { char: 'ノ', romaji: 'no' }] },
  { consonant: 'h', kana: [{ char: 'ハ', romaji: 'ha' }, { char: 'ヒ', romaji: 'hi' }, { char: 'フ', romaji: 'fu' }, { char: 'ヘ', romaji: 'he' }, { char: 'ホ', romaji: 'ho' }] },
  { consonant: 'm', kana: [{ char: 'マ', romaji: 'ma' }, { char: 'ミ', romaji: 'mi' }, { char: 'ム', romaji: 'mu' }, { char: 'メ', romaji: 'me' }, { char: 'モ', romaji: 'mo' }] },
  { consonant: 'y', kana: [{ char: 'ヤ', romaji: 'ya' }, { char: '', romaji: '' }, { char: 'ユ', romaji: 'yu' }, { char: '', romaji: '' }, { char: 'ヨ', romaji: 'yo' }] },
  { consonant: 'r', kana: [{ char: 'ラ', romaji: 'ra' }, { char: 'リ', romaji: 'ri' }, { char: 'ル', romaji: 'ru' }, { char: 'レ', romaji: 're' }, { char: 'ロ', romaji: 'ro' }] },
  { consonant: 'w', kana: [{ char: 'ワ', romaji: 'wa' }, { char: '', romaji: '' }, { char: '', romaji: '' }, { char: '', romaji: '' }, { char: 'ヲ', romaji: 'wo' }] },
  { consonant: 'ン', kana: [{ char: 'ン', romaji: 'n' }, { char: '', romaji: '' }, { char: '', romaji: '' }, { char: '', romaji: '' }, { char: '', romaji: '' }] },
];

const KATAKANA_DAKUTEN: KanaRow[] = [
  { consonant: 'g', kana: [{ char: 'ガ', romaji: 'ga' }, { char: 'ギ', romaji: 'gi' }, { char: 'グ', romaji: 'gu' }, { char: 'ゲ', romaji: 'ge' }, { char: 'ゴ', romaji: 'go' }] },
  { consonant: 'z', kana: [{ char: 'ザ', romaji: 'za' }, { char: 'ジ', romaji: 'ji' }, { char: 'ズ', romaji: 'zu' }, { char: 'ゼ', romaji: 'ze' }, { char: 'ゾ', romaji: 'zo' }] },
  { consonant: 'd', kana: [{ char: 'ダ', romaji: 'da' }, { char: 'ヂ', romaji: 'ji' }, { char: 'ヅ', romaji: 'zu' }, { char: 'デ', romaji: 'de' }, { char: 'ド', romaji: 'do' }] },
  { consonant: 'b', kana: [{ char: 'バ', romaji: 'ba' }, { char: 'ビ', romaji: 'bi' }, { char: 'ブ', romaji: 'bu' }, { char: 'ベ', romaji: 'be' }, { char: 'ボ', romaji: 'bo' }] },
  { consonant: 'p', kana: [{ char: 'パ', romaji: 'pa' }, { char: 'ピ', romaji: 'pi' }, { char: 'プ', romaji: 'pu' }, { char: 'ペ', romaji: 'pe' }, { char: 'ポ', romaji: 'po' }] },
];

const KATAKANA_COMBOS: ComboRow[] = [
  { base: 'キ', combos: [{ char: 'キャ', romaji: 'kya' }, { char: 'キュ', romaji: 'kyu' }, { char: 'キョ', romaji: 'kyo' }] },
  { base: 'シ', combos: [{ char: 'シャ', romaji: 'sha' }, { char: 'シュ', romaji: 'shu' }, { char: 'ショ', romaji: 'sho' }] },
  { base: 'チ', combos: [{ char: 'チャ', romaji: 'cha' }, { char: 'チュ', romaji: 'chu' }, { char: 'チョ', romaji: 'cho' }] },
  { base: 'ニ', combos: [{ char: 'ニャ', romaji: 'nya' }, { char: 'ニュ', romaji: 'nyu' }, { char: 'ニョ', romaji: 'nyo' }] },
  { base: 'ヒ', combos: [{ char: 'ヒャ', romaji: 'hya' }, { char: 'ヒュ', romaji: 'hyu' }, { char: 'ヒョ', romaji: 'hyo' }] },
  { base: 'ミ', combos: [{ char: 'ミャ', romaji: 'mya' }, { char: 'ミュ', romaji: 'myu' }, { char: 'ミョ', romaji: 'myo' }] },
  { base: 'リ', combos: [{ char: 'リャ', romaji: 'rya' }, { char: 'リュ', romaji: 'ryu' }, { char: 'リョ', romaji: 'ryo' }] },
  { base: 'ギ', combos: [{ char: 'ギャ', romaji: 'gya' }, { char: 'ギュ', romaji: 'gyu' }, { char: 'ギョ', romaji: 'gyo' }] },
  { base: 'ジ', combos: [{ char: 'ジャ', romaji: 'ja' }, { char: 'ジュ', romaji: 'ju' }, { char: 'ジョ', romaji: 'jo' }] },
  { base: 'ビ', combos: [{ char: 'ビャ', romaji: 'bya' }, { char: 'ビュ', romaji: 'byu' }, { char: 'ビョ', romaji: 'byo' }] },
  { base: 'ピ', combos: [{ char: 'ピャ', romaji: 'pya' }, { char: 'ピュ', romaji: 'pyu' }, { char: 'ピョ', romaji: 'pyo' }] },
];

const VOWELS = ['a', 'i', 'u', 'e', 'o'];

const SCOPE_LABELS: Record<QuizScope, string> = {
  basic: 'Basic',
  dakuten: 'Dakuten',
  combos: 'Combos',
  all: 'All',
};

export function KanaChartScreen({ navigation }: StudyScreenProps<'KanaChart'>) {
  const [activeType, setActiveType] = useState<KanaType>('hiragana');
  const [showRomaji, setShowRomaji] = useState(true);
  const [screenView, setScreenView] = useState<ScreenView>('chart');
  const [quiz, setQuiz] = useState<QuizState>({
    queue: [], index: 0, options: [], selected: null,
    correct: 0, incorrect: 0, done: false, accuracy: new Map(),
  });

  const basicRows = activeType === 'hiragana' ? HIRAGANA_BASIC : KATAKANA_BASIC;
  const dakutenRows = activeType === 'hiragana' ? HIRAGANA_DAKUTEN : KATAKANA_DAKUTEN;
  const comboRows = activeType === 'hiragana' ? HIRAGANA_COMBOS : KATAKANA_COMBOS;

  const allKanaPool = useMemo<KanaItem[]>(() => [
    ...flattenKanaRows(basicRows),
    ...flattenKanaRows(dakutenRows),
    ...comboRows.flatMap(r => r.combos),
  ], [basicRows, dakutenRows, comboRows]);

  const startQuiz = useCallback((scope: QuizScope) => {
    let items: KanaItem[];
    if (scope === 'basic') items = flattenKanaRows(basicRows);
    else if (scope === 'dakuten') items = flattenKanaRows(dakutenRows);
    else if (scope === 'combos') items = comboRows.flatMap(r => r.combos);
    else items = allKanaPool;

    const queue = buildQuizQueue(items);
    const first = queue[0];
    const pool = items.filter(k => k.romaji !== first.romaji);
    setQuiz({
      queue,
      index: 0,
      options: buildOptions(first, pool),
      selected: null,
      correct: 0,
      incorrect: 0,
      done: false,
      accuracy: new Map(),
    });
    setScreenView('quiz');
  }, [basicRows, dakutenRows, comboRows, allKanaPool]);

  // Auto-advance after answer shown
  useEffect(() => {
    if (quiz.selected === null || screenView !== 'quiz') return;
    const timer = setTimeout(() => {
      const isLast = quiz.index >= quiz.queue.length - 1;
      if (isLast) {
        setQuiz(q => ({ ...q, done: true, selected: null }));
        return;
      }
      const nextIndex = quiz.index + 1;
      const next = quiz.queue[nextIndex];
      const pool = quiz.queue.filter(k => k.romaji !== next.romaji);
      setQuiz(q => ({ ...q, index: nextIndex, options: buildOptions(next, pool), selected: null }));
    }, 700);
    return () => clearTimeout(timer);
  }, [quiz.selected, quiz.index, quiz.queue, screenView]);

  const selectOption = useCallback((opt: string) => {
    if (quiz.selected !== null) return;
    const current = quiz.queue[quiz.index];
    const wasCorrect = opt === current.romaji;
    setQuiz(q => {
      const acc = new Map(q.accuracy);
      const prev = acc.get(current.char) ?? { correct: 0, total: 0 };
      acc.set(current.char, { correct: prev.correct + (wasCorrect ? 1 : 0), total: prev.total + 1 });
      return {
        ...q,
        selected: opt,
        correct: q.correct + (wasCorrect ? 1 : 0),
        incorrect: q.incorrect + (wasCorrect ? 0 : 1),
        accuracy: acc,
      };
    });
    if (wasCorrect) speakJapanese(current.char);
  }, [quiz.selected, quiz.index, quiz.queue]);

  const renderKanaRow = (row: KanaRow, rowIndex: number) => (
    <View key={rowIndex} style={styles.kanaRow}>
      <View style={styles.consonantCell}>
        <Caption color="textMuted">{row.consonant}</Caption>
      </View>
      {row.kana.map((item, colIndex) => (
        <Pressable
          key={`${rowIndex}-${colIndex}`}
          style={[styles.kanaCell, !item.char && styles.emptyCell]}
          onPress={() => item.char && speakJapanese(item.char)}
          disabled={!item.char}
        >
          {item.char ? (
            <>
              <Text variant="japaneseLarge" style={styles.kanaChar}>{item.char}</Text>
              {showRomaji && <Caption color="textMuted">{item.romaji}</Caption>}
            </>
          ) : null}
        </Pressable>
      ))}
    </View>
  );

  const renderComboRow = (row: ComboRow, rowIndex: number) => (
    <View key={rowIndex} style={styles.comboRow}>
      <View style={styles.comboBaseCell}>
        <Text variant="japaneseLarge" style={styles.comboBaseChar}>{row.base}</Text>
      </View>
      {row.combos.map((item, colIndex) => (
        <Pressable
          key={`combo-${rowIndex}-${colIndex}`}
          style={styles.comboCell}
          onPress={() => speakJapanese(item.char)}
        >
          <Text variant="japaneseLarge" style={styles.comboChar}>{item.char}</Text>
          {showRomaji && <Caption color="textMuted">{item.romaji}</Caption>}
        </Pressable>
      ))}
    </View>
  );

  // ─── Quiz render ────────────────────────────────────────────────────────────

  const renderQuiz = () => {
    if (quiz.done) {
      const total = quiz.correct + quiz.incorrect;
      const pct = total > 0 ? Math.round((quiz.correct / total) * 100) : 0;
      const weakChars = [...quiz.accuracy.entries()]
        .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.8)
        .map(([char]) => char);
      return (
        <View style={styles.quizDone}>
          <Text style={styles.quizDoneEmoji}>🎉</Text>
          <Heading3 align="center">Quiz complete!</Heading3>
          <Caption color="textSecondary" align="center">
            {quiz.correct} / {total} correct ({pct}%)
          </Caption>
          {weakChars.length > 0 && (
            <View style={styles.weakBox}>
              <Caption color="textMuted">Keep practising:</Caption>
              <View style={styles.weakChars}>
                {weakChars.map(c => (
                  <View key={c} style={styles.weakChip}>
                    <Text style={styles.weakChar}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          <View style={styles.quizDoneActions}>
            {(Object.keys(SCOPE_LABELS) as QuizScope[]).map(scope => (
              <Pressable key={scope} style={styles.scopeBtn} onPress={() => startQuiz(scope)}>
                <Caption color="primary">{SCOPE_LABELS[scope]}</Caption>
              </Pressable>
            ))}
          </View>
        </View>
      );
    }

    const current = quiz.queue[quiz.index];
    if (!current) return null;
    const pct = (quiz.index / quiz.queue.length) * 100;

    return (
      <View style={styles.quizContainer}>
        <View style={styles.quizProgress}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
          <Caption color="textMuted">{quiz.index + 1} / {quiz.queue.length}</Caption>
        </View>

        <View style={styles.quizCardArea}>
          <Text style={styles.quizCharacter}>{current.char}</Text>
          <View style={styles.quizOptions}>
            {quiz.options.map(opt => {
              const isSelected = quiz.selected === opt;
              const isCorrect = opt === current.romaji;
              const showGreen = isCorrect && (isSelected || quiz.selected !== null);
              const showRed = isSelected && !isCorrect;
              return (
                <Pressable
                  key={opt}
                  style={[styles.quizOption, showGreen && styles.quizOptionCorrect, showRed && styles.quizOptionWrong]}
                  onPress={() => selectOption(opt)}
                  disabled={quiz.selected !== null}
                >
                  <Text style={styles.quizOptionText}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.quizScore}>
          <View style={[styles.scoreBadge, styles.scoreBadgeCorrect]}>
            <Caption color="success">✓ {quiz.correct}</Caption>
          </View>
          <View style={[styles.scoreBadge, styles.scoreBadgeIncorrect]}>
            <Caption color="error">✗ {quiz.incorrect}</Caption>
          </View>
        </View>
      </View>
    );
  };

  // ─── Root ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={screenView === 'quiz' ? () => setScreenView('chart') : () => navigation.goBack()}>
            <Text color="primary">← {screenView === 'quiz' ? 'Chart' : 'Back'}</Text>
          </TouchableOpacity>
          <Heading2>Kana {screenView === 'quiz' ? 'Quiz' : 'Chart'}</Heading2>
          {screenView === 'chart' ? (
            <TouchableOpacity onPress={() => setShowRomaji(!showRomaji)}>
              <Caption color={showRomaji ? 'primary' : 'textMuted'}>
                {showRomaji ? 'Hide' : 'Show'} Romaji
              </Caption>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 48 }} />
          )}
        </View>

        <View style={styles.toggleContainer}>
          <Pressable
            style={[styles.toggleButton, activeType === 'hiragana' && styles.toggleActive]}
            onPress={() => { setActiveType('hiragana'); setScreenView('chart'); }}
          >
            <Text variant="body" color={activeType === 'hiragana' ? 'textPrimary' : 'textMuted'}
              style={activeType === 'hiragana' ? styles.toggleTextActive : undefined}>
              ひらがな
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleButton, activeType === 'katakana' && styles.toggleActive]}
            onPress={() => { setActiveType('katakana'); setScreenView('chart'); }}
          >
            <Text variant="body" color={activeType === 'katakana' ? 'textPrimary' : 'textMuted'}
              style={activeType === 'katakana' ? styles.toggleTextActive : undefined}>
              カタカナ
            </Text>
          </Pressable>
        </View>

        {screenView === 'chart' && (
          <View style={styles.quizScopeRow}>
            <Caption color="textMuted">Quiz: </Caption>
            {(Object.keys(SCOPE_LABELS) as QuizScope[]).map(scope => (
              <Pressable key={scope} style={styles.scopeBtn} onPress={() => startQuiz(scope)}>
                <Caption color="primary">{SCOPE_LABELS[scope]}</Caption>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {screenView === 'quiz' ? renderQuiz() : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic */}
          <Heading3 style={styles.sectionTitle}>Basic</Heading3>
          <View style={styles.vowelRow}>
            <View style={styles.consonantCell} />
            {VOWELS.map(v => (
              <View key={v} style={styles.vowelCell}>
                <Caption color="primary">{v}</Caption>
              </View>
            ))}
          </View>
          {basicRows.map(renderKanaRow)}

          {/* Dakuten / Handakuten */}
          <Heading3 style={[styles.sectionTitle, styles.sectionGap]}>Dakuten ゛/ Handakuten ゜</Heading3>
          <View style={styles.vowelRow}>
            <View style={styles.consonantCell} />
            {VOWELS.map(v => (
              <View key={v} style={styles.vowelCell}>
                <Caption color="primary">{v}</Caption>
              </View>
            ))}
          </View>
          {dakutenRows.map(renderKanaRow)}

          {/* Combo kana */}
          <Heading3 style={[styles.sectionTitle, styles.sectionGap]}>Combinations</Heading3>
          <View style={styles.comboHeaderRow}>
            <View style={styles.comboBaseCell} />
            {['ya', 'yu', 'yo'].map(v => (
              <View key={v} style={styles.comboCell}>
                <Caption color="primary">{v}</Caption>
              </View>
            ))}
          </View>
          {comboRows.map(renderComboRow)}

          <View style={styles.footer}>
            <Caption color="textMuted" style={styles.footerText}>
              Tap any character to hear its pronunciation
            </Caption>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    padding: layout.screenPaddingHorizontal,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  toggleActive: { backgroundColor: colors.primaryMuted },
  toggleTextActive: { fontWeight: '600' },
  scrollView: { flex: 1 },
  content: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  sectionTitle: { marginBottom: spacing.sm },
  sectionGap: { marginTop: spacing.xl },
  vowelRow: { flexDirection: 'row', marginBottom: spacing.sm },
  vowelCell: { flex: 1, alignItems: 'center', paddingVertical: spacing.xs },
  consonantCell: { width: 24, alignItems: 'center', justifyContent: 'center' },
  kanaRow: { flexDirection: 'row', marginBottom: spacing.xs },
  kanaCell: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
  emptyCell: { backgroundColor: 'transparent' },
  kanaChar: { fontSize: 26, lineHeight: 30 },
  // Combo rows
  comboHeaderRow: { flexDirection: 'row', marginBottom: spacing.sm },
  comboRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    alignItems: 'center',
  },
  comboBaseCell: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comboBaseChar: { fontSize: 20, lineHeight: 24, color: colors.textMuted },
  comboCell: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  comboChar: { fontSize: 22, lineHeight: 26 },
  footer: { marginTop: spacing.xl, alignItems: 'center' },
  footerText: { textAlign: 'center' },
  // Quiz scope buttons in chart header
  quizScopeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  scopeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  // Quiz screen
  quizContainer: { flex: 1, padding: layout.screenPaddingHorizontal },
  quizProgress: { paddingVertical: spacing.md, gap: spacing.xs },
  progressTrack: { height: 6, backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.full, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: borderRadius.full },
  quizCardArea: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.xl },
  quizCharacter: { fontSize: 96, lineHeight: 108, color: colors.textPrimary },
  quizOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, width: '100%' },
  quizOption: {
    width: '47%',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quizOptionCorrect: { backgroundColor: colors.successMuted, borderColor: colors.success },
  quizOptionWrong: { backgroundColor: colors.errorMuted, borderColor: colors.error },
  quizOptionText: { fontSize: 16, color: colors.textPrimary },
  quizScore: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md, paddingVertical: spacing.md },
  scoreBadge: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.md, backgroundColor: colors.surface },
  scoreBadgeCorrect: { backgroundColor: colors.successMuted },
  scoreBadgeIncorrect: { backgroundColor: colors.errorMuted },
  // Done screen
  quizDone: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  quizDoneEmoji: { fontSize: 64 },
  quizDoneActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginTop: spacing.md },
  weakBox: { gap: spacing.sm, alignItems: 'center' },
  weakChars: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  weakChip: {
    width: 44, height: 44,
    backgroundColor: colors.errorMuted,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weakChar: { fontSize: 24, lineHeight: 28, color: colors.textPrimary },
});

export default KanaChartScreen;
