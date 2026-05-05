import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Pressable, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, Text, Heading2, Heading3, Body, Caption, Button } from '@/components/shared';
import { colors, spacing, layout, borderRadius } from '@/theme';
import { useAuthStore } from '@/store';
import { speakJapanese } from '@/services/tts';
import { useScreenAnalytics } from '@/hooks';
import { calculateNextReview, DEFAULT_SRS_VALUES } from '@/services/srs';
import { calculateXpEarned } from '@/services/xpCalculator';
import type { StudyScreenProps, JlptLevel, KanjiCard, KanjiProgress, KanjiReviewResult } from '@/types';
import { getKanjiByLevel, getKanjiProgress, saveKanjiSessionResults } from '@/api';

const JLPT_LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

type ScreenMode = 'browse' | 'practice';
type QuizMode = 'recall' | 'meaning' | 'reading';

interface PracticeState {
  queue: KanjiCard[];
  index: number;
  quizMode: QuizMode;
  // recall mode
  revealed: boolean;
  // quiz modes (meaning / reading)
  options: string[];
  selected: string | null;
  // session totals
  results: KanjiReviewResult[];
  correct: number;
  incorrect: number;
  xpEarned: number;
  done: boolean;
}

function buildPracticeQueue(kanjiList: KanjiCard[], progressMap: Map<string, KanjiProgress>): KanjiCard[] {
  const due: KanjiCard[] = [];
  const newCards: KanjiCard[] = [];
  for (const k of kanjiList) {
    const p = progressMap.get(k.id);
    if (!p || p.status === 'new') {
      newCards.push(k);
    } else if (p.nextReview <= new Date()) {
      due.push(k);
    }
  }
  return [...due, ...newCards.slice(0, 10)];
}

function pickDistractors(all: KanjiCard[], current: KanjiCard, count: number): KanjiCard[] {
  const pool = all.filter(k => k.id !== current.id);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildMeaningOptions(all: KanjiCard[], current: KanjiCard): string[] {
  const distractors = pickDistractors(all, current, 3);
  const correct = current.meanings[0];
  const options = [correct, ...distractors.map(k => k.meanings[0])];
  return options.sort(() => Math.random() - 0.5);
}

function buildReadingOptions(all: KanjiCard[], current: KanjiCard): string[] {
  const correct = current.onyomi[0] ?? current.kunyomi[0] ?? '?';
  const distractors = pickDistractors(all, current, 3).map(k => k.onyomi[0] ?? k.kunyomi[0] ?? '?');
  const options = [correct, ...distractors];
  return options.sort(() => Math.random() - 0.5);
}

function getCorrectOption(kanji: KanjiCard, quizMode: QuizMode): string {
  if (quizMode === 'meaning') return kanji.meanings[0];
  return kanji.onyomi[0] ?? kanji.kunyomi[0] ?? '?';
}

function openStrokeOrder(character: string) {
  const url = `https://jisho.org/search/${encodeURIComponent(character)}%23kanji`;
  Linking.openURL(url).catch(() => {});
}

const QUIZ_MODE_LABELS: Record<QuizMode, string> = {
  recall: 'Recall',
  meaning: 'Meaning',
  reading: 'Reading',
};

export function KanjiPracticeScreen({ navigation }: StudyScreenProps<'KanjiPractice'>) {
  useScreenAnalytics('KanjiPractice');
  const user = useAuthStore(s => s.user);
  const updateUserStore = useAuthStore(s => s.updateUser);
  const queryClient = useQueryClient();
  const [selectedLevel, setSelectedLevel] = useState<JlptLevel>(user?.currentLevel ?? 'N5');
  const [mode, setMode] = useState<ScreenMode>('browse');
  const [flipped, setFlipped] = useState<string | null>(null);
  const [practice, setPractice] = useState<PracticeState>({
    queue: [], index: 0, quizMode: 'recall',
    revealed: false, options: [], selected: null,
    results: [], correct: 0, incorrect: 0, xpEarned: 0, done: false,
  });

  // Track session start time for duration calc
  const sessionStartRef = useRef<Date>(new Date());

  const { data: kanjiList, isLoading, isError, error } = useQuery({
    queryKey: ['kanji', selectedLevel],
    queryFn: () => getKanjiByLevel(selectedLevel),
    staleTime: 10 * 60 * 1000,
  });

  const { data: progressMap = new Map<string, KanjiProgress>() } = useQuery({
    queryKey: ['kanjiProgress', user?.uid],
    queryFn: () => user?.uid ? getKanjiProgress(user.uid) : Promise.resolve(new Map<string, KanjiProgress>()),
    enabled: !!user?.uid,
    staleTime: 2 * 60 * 1000,
  });

  const dueCount = useMemo(() => {
    if (!kanjiList) return 0;
    return buildPracticeQueue(kanjiList, progressMap).length;
  }, [kanjiList, progressMap]);

  const currentKanji: KanjiCard | null = practice.queue[practice.index] ?? null;

  // Auto-advance after a quiz answer is shown
  useEffect(() => {
    if (practice.selected === null || practice.quizMode === 'recall') return;
    const timer = setTimeout(() => {
      const isLast = practice.index >= practice.queue.length - 1;
      setPractice(p => ({ ...p, selected: null, index: isLast ? p.index : p.index + 1, done: isLast }));
    }, 900);
    return () => clearTimeout(timer);
  }, [practice.selected, practice.quizMode, practice.index, practice.queue.length]);

  const handleFlip = useCallback((id: string) => {
    setFlipped(prev => (prev === id ? null : id));
  }, []);

  const startPractice = useCallback((quizMode: QuizMode) => {
    if (!kanjiList) return;
    const queue = buildPracticeQueue(kanjiList, progressMap);
    const finalQueue = queue.length === 0 ? kanjiList.slice(0, 20) : queue;
    sessionStartRef.current = new Date();

    const firstKanji = finalQueue[0];
    const options = quizMode === 'meaning'
      ? buildMeaningOptions(kanjiList, firstKanji)
      : quizMode === 'reading'
      ? buildReadingOptions(kanjiList, firstKanji)
      : [];

    setPractice({
      queue: finalQueue, index: 0, quizMode,
      revealed: false, options, selected: null,
      results: [], correct: 0, incorrect: 0, xpEarned: 0, done: false,
    });
    setMode('practice');
  }, [kanjiList, progressMap]);

  const revealCard = useCallback(() => {
    setPractice(p => ({ ...p, revealed: true }));
    if (currentKanji) speakJapanese(currentKanji.character);
  }, [currentKanji]);

  const grade = useCallback((wasCorrect: boolean) => {
    if (!currentKanji || !user) return;

    const existing = progressMap.get(currentKanji.id);
    const srsInput = existing
      ? { interval: existing.interval, easeFactor: existing.easeFactor, repetitions: existing.repetitions }
      : DEFAULT_SRS_VALUES;

    const srsUpdate = calculateNextReview(srsInput, wasCorrect ? 4 : 1);
    const xp = calculateXpEarned(srsUpdate.interval, wasCorrect);

    const result: KanjiReviewResult = { kanjiId: currentKanji.id, correct: wasCorrect, srsUpdate };

    const isLast = practice.index >= practice.queue.length - 1;

    // Build options for next card if in quiz mode
    let nextOptions: string[] = [];
    if (!isLast && practice.quizMode !== 'recall' && kanjiList) {
      const nextKanji = practice.queue[practice.index + 1];
      nextOptions = practice.quizMode === 'meaning'
        ? buildMeaningOptions(kanjiList, nextKanji)
        : buildReadingOptions(kanjiList, nextKanji);
    }

    setPractice(p => ({
      ...p,
      index: isLast ? p.index : p.index + 1,
      revealed: false,
      options: nextOptions,
      selected: null,
      results: [...p.results, result],
      correct: p.correct + (wasCorrect ? 1 : 0),
      incorrect: p.incorrect + (wasCorrect ? 0 : 1),
      xpEarned: p.xpEarned + xp,
      done: isLast,
    }));

    if (isLast) {
      // Persist entire session at the end
      const allResults = [...practice.results, result];
      saveKanjiSessionResults(user.uid, {
        results: allResults,
        startedAt: sessionStartRef.current,
        currentStreak: user.currentStreak ?? 0,
        dailyGoal: user.settings?.dailyNewCards ?? 5,
      }).then(({ xpEarned, currentStreak, longestStreak }) => {
        updateUserStore({ totalXp: (user.totalXp ?? 0) + xpEarned, currentStreak, longestStreak });
        queryClient.invalidateQueries({ queryKey: ['kanjiProgress', user.uid] });
        queryClient.invalidateQueries({ queryKey: ['dueKanji', user.uid] });
      }).catch(() => {});
    }
  }, [currentKanji, user, progressMap, practice, kanjiList, queryClient, updateUserStore]);

  const selectQuizOption = useCallback((option: string) => {
    if (!currentKanji || practice.selected !== null) return;
    const correct = getCorrectOption(currentKanji, practice.quizMode);
    const wasCorrect = option === correct;
    setPractice(p => ({ ...p, selected: option }));
    // grade() handles SRS + session accumulation
    grade(wasCorrect);
  }, [currentKanji, practice.selected, practice.quizMode, grade]);

  // ─── Browse ───────────────────────────────────────────────────────────────

  const renderBrowse = () => (
    <>
      <View style={styles.browseActions}>
        {dueCount > 0 && (
          <View style={styles.dueChip}>
            <Caption color="primary">{dueCount} due</Caption>
          </View>
        )}
        <View style={styles.quizModeRow}>
          {(Object.keys(QUIZ_MODE_LABELS) as QuizMode[]).map(qm => (
            <Pressable key={qm} style={styles.modeBtn} onPress={() => startPractice(qm)}>
              <Caption color="primary">{QUIZ_MODE_LABELS[qm]}</Caption>
            </Pressable>
          ))}
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {kanjiList!.map(kanji => {
          const isFlipped = flipped === kanji.id;
          const progress = progressMap.get(kanji.id);
          return (
            <Pressable key={kanji.id} style={styles.cardWrapper} onPress={() => handleFlip(kanji.id)}>
              <Card variant="elevated" style={styles.card}>
                {progress?.status && progress.status !== 'new' && (
                  <View style={[
                    styles.statusDot,
                    progress.status === 'learning' && styles.statusDot_learning,
                    progress.status === 'review' && styles.statusDot_review,
                    progress.status === 'mastered' && styles.statusDot_mastered,
                  ]} />
                )}
                {!isFlipped ? (
                  <View style={styles.front}>
                    <Text style={styles.character}>{kanji.character}</Text>
                    <Caption color="textMuted">Tap to reveal</Caption>
                  </View>
                ) : (
                  <View style={styles.back}>
                    <View style={styles.backHeader}>
                      <Text style={styles.characterSmall}>{kanji.character}</Text>
                      <Pressable onPress={() => speakJapanese(kanji.character)} hitSlop={8}>
                        <Caption color="primary">🔊</Caption>
                      </Pressable>
                      <Pressable onPress={() => openStrokeOrder(kanji.character)} hitSlop={8}>
                        <Caption color="textMuted">✏️</Caption>
                      </Pressable>
                    </View>
                    <View style={styles.readings}>
                      {kanji.onyomi.length > 0 && (
                        <Caption color="textMuted">音: {kanji.onyomi.join('・')}</Caption>
                      )}
                      {kanji.kunyomi.length > 0 && (
                        <Caption color="textMuted">訓: {kanji.kunyomi.join('・')}</Caption>
                      )}
                    </View>
                    <Body color="textSecondary" align="center">
                      {kanji.meanings.slice(0, 3).join(', ')}
                    </Body>
                    {kanji.strokeCount > 0 && (
                      <Caption color="textMuted">{kanji.strokeCount} strokes</Caption>
                    )}
                  </View>
                )}
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );

  // ─── Practice ─────────────────────────────────────────────────────────────

  const renderDoneScreen = () => {
    const total = practice.correct + practice.incorrect;
    const pct = total > 0 ? Math.round((practice.correct / total) * 100) : 0;
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>🎉</Text>
        <Heading3 align="center">Session complete!</Heading3>
        <Body color="textSecondary" align="center">
          {practice.correct} / {total} correct ({pct}%)
        </Body>
        <Caption color="primary">+{practice.xpEarned} XP</Caption>
        <View style={styles.doneActions}>
          <Button title="Practice again" onPress={() => startPractice(practice.quizMode)} />
          <Button title="Back to browse" variant="ghost" onPress={() => setMode('browse')} />
        </View>
      </View>
    );
  };

  const renderRecallCard = () => {
    if (!currentKanji) return null;
    return (
      <View style={styles.practiceCardArea}>
        <Card variant="elevated" style={styles.practiceCard}>
          <View style={styles.practiceCardHeader}>
            <Text style={styles.practiceCharacter}>{currentKanji.character}</Text>
            <View style={styles.practiceCardActions}>
              <Pressable onPress={() => speakJapanese(currentKanji.character)} hitSlop={8}>
                <Caption color="primary">🔊</Caption>
              </Pressable>
              <Pressable onPress={() => openStrokeOrder(currentKanji.character)} hitSlop={8}>
                <Caption color="textMuted">✏️</Caption>
              </Pressable>
            </View>
          </View>
          {!practice.revealed ? (
            <Button title="Reveal" onPress={revealCard} />
          ) : (
            <View style={styles.revealedContent}>
              <View style={styles.readings}>
                {currentKanji.onyomi.length > 0 && (
                  <Body align="center" color="textSecondary">音読み: {currentKanji.onyomi.join('・')}</Body>
                )}
                {currentKanji.kunyomi.length > 0 && (
                  <Body align="center" color="textSecondary">訓読み: {currentKanji.kunyomi.join('・')}</Body>
                )}
              </View>
              <Heading3 align="center">{currentKanji.meanings.slice(0, 3).join(', ')}</Heading3>
              {currentKanji.examples.length > 0 && (
                <View style={styles.exampleBox}>
                  <Caption color="textMuted">
                    {currentKanji.examples[0].word} {currentKanji.examples[0].reading}
                  </Caption>
                  <Caption color="textMuted">{currentKanji.examples[0].meaning}</Caption>
                </View>
              )}
              <View style={styles.gradeRow}>
                <Pressable style={[styles.gradeBtn, styles.gradeBtnIncorrect]} onPress={() => grade(false)}>
                  <Text style={styles.gradeBtnText}>✗ Missed</Text>
                </Pressable>
                <Pressable style={[styles.gradeBtn, styles.gradeBtnCorrect]} onPress={() => grade(true)}>
                  <Text style={styles.gradeBtnText}>✓ Got it</Text>
                </Pressable>
              </View>
            </View>
          )}
        </Card>
      </View>
    );
  };

  const renderQuizCard = () => {
    if (!currentKanji) return null;
    const isReading = practice.quizMode === 'reading';
    const correct = getCorrectOption(currentKanji, practice.quizMode);

    return (
      <View style={styles.practiceCardArea}>
        <Card variant="elevated" style={styles.practiceCard}>
          {isReading ? (
            // Show character, pick reading
            <Text style={styles.practiceCharacter}>{currentKanji.character}</Text>
          ) : (
            // Show meaning, pick kanji — show meaning as prompt
            <View style={styles.meaningPrompt}>
              <Caption color="textMuted">Which kanji means…</Caption>
              <Heading3 align="center">{currentKanji.meanings.slice(0, 2).join(', ')}</Heading3>
            </View>
          )}
          <View style={styles.optionsGrid}>
            {practice.options.map(opt => {
              const isSelected = practice.selected === opt;
              const isCorrectOpt = opt === correct;
              const showCorrect = isCorrectOpt && (isSelected || practice.selected !== null);
              const showWrong = isSelected && !isCorrectOpt;
              return (
                <Pressable
                  key={opt}
                  style={[styles.optionBtn, showCorrect && styles.optionCorrect, showWrong && styles.optionWrong]}
                  onPress={() => selectQuizOption(opt)}
                  disabled={practice.selected !== null}
                >
                  <Text style={styles.optionText}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      </View>
    );
  };

  const renderPractice = () => {
    if (practice.done || !currentKanji) return renderDoneScreen();

    const total = practice.queue.length;
    const progressPct = (practice.index / total) * 100;

    return (
      <View style={styles.practiceContainer}>
        <View style={styles.practiceProgress}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Caption color="textMuted">{practice.index + 1} / {total}</Caption>
        </View>

        {practice.quizMode === 'recall' ? renderRecallCard() : renderQuizCard()}

        <View style={styles.scoreRow}>
          <View style={[styles.scoreBadge, styles.scoreBadgeCorrect]}>
            <Caption color="success">✓ {practice.correct}</Caption>
          </View>
          <View style={[styles.scoreBadge, styles.scoreBadgeIncorrect]}>
            <Caption color="error">✗ {practice.incorrect}</Caption>
          </View>
          {practice.xpEarned > 0 && (
            <View style={styles.scoreBadge}>
              <Caption color="primary">+{practice.xpEarned} XP</Caption>
            </View>
          )}
        </View>
      </View>
    );
  };

  // ─── Root ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={mode === 'practice' ? () => setMode('browse') : () => navigation.goBack()}>
          <Text color="primary">← {mode === 'practice' ? 'Browse' : 'Back'}</Text>
        </TouchableOpacity>
        <Heading2>Kanji</Heading2>
        {mode === 'practice' ? (
          <Caption color="textMuted">{QUIZ_MODE_LABELS[practice.quizMode]}</Caption>
        ) : (
          <View style={{ width: 48 }} />
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
        {JLPT_LEVELS.map(level => (
          <Pressable
            key={level}
            style={[styles.tab, selectedLevel === level && styles.tabActive]}
            onPress={() => { setSelectedLevel(level); setMode('browse'); setFlipped(null); }}
          >
            <Text variant="label" color={selectedLevel === level ? 'primary' : 'textMuted'}>{level}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Caption>Loading kanji...</Caption>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>⚠️</Text>
          <Heading3 align="center">Failed to load kanji</Heading3>
          <Body color="textSecondary" align="center">{(error as Error)?.message ?? 'Unknown error'}</Body>
        </View>
      ) : !kanjiList || kanjiList.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>漢</Text>
          <Heading3 align="center">No kanji yet</Heading3>
          <Body color="textSecondary" align="center">{selectedLevel} kanji data is coming soon.</Body>
        </View>
      ) : mode === 'browse' ? (
        renderBrowse()
      ) : (
        renderPractice()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: layout.screenPaddingHorizontal,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabs: { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabsContent: { paddingHorizontal: layout.screenPaddingHorizontal, gap: spacing.sm, alignItems: 'center' },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  tabActive: { backgroundColor: colors.primaryMuted },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  emptyEmoji: { fontSize: 64, color: colors.textMuted },

  // Browse
  browseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  dueChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.full,
  },
  quizModeRow: { flexDirection: 'row', gap: spacing.xs },
  modeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: layout.screenPaddingHorizontal,
    gap: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  cardWrapper: { width: '47%' },
  card: { minHeight: 120, alignItems: 'center', justifyContent: 'center', padding: spacing.md, gap: spacing.xs },
  statusDot: { position: 'absolute', top: spacing.sm, right: spacing.sm, width: 8, height: 8, borderRadius: 4 },
  statusDot_learning: { backgroundColor: colors.warning },
  statusDot_review: { backgroundColor: colors.primary },
  statusDot_mastered: { backgroundColor: colors.success },
  front: { alignItems: 'center', gap: spacing.xs },
  back: { alignItems: 'center', gap: spacing.xs },
  backHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  character: { fontSize: 52, lineHeight: 60, color: colors.textPrimary },
  characterSmall: { fontSize: 32, lineHeight: 38, color: colors.textPrimary },
  readings: { alignItems: 'center', gap: 2 },

  // Practice shared
  practiceContainer: { flex: 1, padding: layout.screenPaddingHorizontal },
  practiceProgress: { paddingVertical: spacing.md, gap: spacing.xs },
  progressTrack: { height: 6, backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.full, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: borderRadius.full },
  practiceCardArea: { flex: 1, justifyContent: 'center' },
  practiceCard: { alignItems: 'center', padding: spacing.xl, gap: spacing.lg },
  practiceCharacter: { fontSize: 96, lineHeight: 108, color: colors.textPrimary },
  practiceCardHeader: { alignItems: 'center', gap: spacing.xs },
  practiceCardActions: { flexDirection: 'row', gap: spacing.md },
  revealedContent: { alignItems: 'center', gap: spacing.md, width: '100%' },
  exampleBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    width: '100%',
  },
  gradeRow: { flexDirection: 'row', gap: spacing.md, width: '100%', marginTop: spacing.sm },
  gradeBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' },
  gradeBtnIncorrect: { backgroundColor: colors.errorMuted },
  gradeBtnCorrect: { backgroundColor: colors.successMuted },
  gradeBtnText: { fontSize: 16, fontWeight: '600' },

  // Quiz options
  meaningPrompt: { alignItems: 'center', gap: spacing.xs },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, width: '100%' },
  optionBtn: {
    width: '47%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionCorrect: { backgroundColor: colors.successMuted, borderColor: colors.success },
  optionWrong: { backgroundColor: colors.errorMuted, borderColor: colors.error },
  optionText: { fontSize: 14, color: colors.textPrimary, textAlign: 'center' },

  // Score row
  scoreRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md, paddingVertical: spacing.md },
  scoreBadge: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.md, backgroundColor: colors.surface },
  scoreBadgeCorrect: { backgroundColor: colors.successMuted },
  scoreBadgeIncorrect: { backgroundColor: colors.errorMuted },
  doneActions: { gap: spacing.md, width: '100%', marginTop: spacing.md },
});

export default KanjiPracticeScreen;
