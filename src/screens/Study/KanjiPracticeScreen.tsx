import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card, Text, Heading2, Heading3, Body, Caption, Button } from '@/components/shared';
import { colors, spacing, layout, borderRadius } from '@/theme';
import { useAuthStore } from '@/store';
import { speakJapanese } from '@/services/tts';
import { useScreenAnalytics } from '@/hooks';
import type { StudyScreenProps, JlptLevel, KanjiCard } from '@/types';
import { getKanjiByLevel, updateKanjiProgress } from '@/api';

const JLPT_LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

type ScreenMode = 'browse' | 'practice';

interface PracticeState {
  index: number;
  revealed: boolean;
  correct: number;
  incorrect: number;
  done: boolean;
}

export function KanjiPracticeScreen({ navigation }: StudyScreenProps<'KanjiPractice'>) {
  useScreenAnalytics('KanjiPractice');
  const user = useAuthStore(s => s.user);
  const [selectedLevel, setSelectedLevel] = useState<JlptLevel>(user?.currentLevel ?? 'N5');
  const [mode, setMode] = useState<ScreenMode>('browse');
  const [flipped, setFlipped] = useState<string | null>(null);
  const [practice, setPractice] = useState<PracticeState>({
    index: 0, revealed: false, correct: 0, incorrect: 0, done: false,
  });

  const { data: kanjiList, isLoading, isError, error } = useQuery({
    queryKey: ['kanji', selectedLevel],
    queryFn: () => getKanjiByLevel(selectedLevel),
    staleTime: 10 * 60 * 1000,
  });

  const currentKanji: KanjiCard | null = useMemo(
    () => kanjiList?.[practice.index] ?? null,
    [kanjiList, practice.index]
  );

  const handleFlip = useCallback((id: string) => {
    setFlipped(prev => (prev === id ? null : id));
  }, []);

  const startPractice = useCallback(() => {
    setPractice({ index: 0, revealed: false, correct: 0, incorrect: 0, done: false });
    setMode('practice');
  }, []);

  const revealCard = useCallback(() => {
    setPractice(p => ({ ...p, revealed: true }));
    if (currentKanji) speakJapanese(currentKanji.character);
  }, [currentKanji]);

  const grade = useCallback((wasCorrect: boolean) => {
    if (!kanjiList || !currentKanji || !user) return;

    updateKanjiProgress(user.uid, currentKanji.id, {
      seen: true,
      correct: wasCorrect ? 1 : 0,
      incorrect: wasCorrect ? 0 : 1,
      lastSeen: new Date(),
    }).catch(() => {});

    const isLast = practice.index >= kanjiList.length - 1;
    setPractice(p => ({
      index: isLast ? p.index : p.index + 1,
      revealed: false,
      correct: p.correct + (wasCorrect ? 1 : 0),
      incorrect: p.incorrect + (wasCorrect ? 0 : 1),
      done: isLast,
    }));
  }, [kanjiList, currentKanji, user, practice.index]);

  const renderEmpty = () => (
    <View style={styles.center}>
      <Text style={styles.emptyEmoji}>漢</Text>
      <Heading3 align="center">No kanji yet</Heading3>
      <Body color="textSecondary" align="center">
        {selectedLevel} kanji data is coming soon.
      </Body>
    </View>
  );

  const renderBrowse = () => (
    <>
      <View style={styles.browseActions}>
        <Button title="Practice" size="small" onPress={startPractice} />
      </View>
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {kanjiList!.map(kanji => {
          const isFlipped = flipped === kanji.id;
          return (
            <Pressable key={kanji.id} style={styles.cardWrapper} onPress={() => handleFlip(kanji.id)}>
              <Card variant="elevated" style={styles.card}>
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

  const renderPractice = () => {
    if (practice.done || !currentKanji) {
      const total = practice.correct + practice.incorrect;
      const pct = total > 0 ? Math.round((practice.correct / total) * 100) : 0;
      return (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Heading3 align="center">Session complete!</Heading3>
          <Body color="textSecondary" align="center">
            {practice.correct} / {total} correct ({pct}%)
          </Body>
          <View style={styles.doneActions}>
            <Button title="Practice again" onPress={startPractice} />
            <Button title="Back to browse" variant="ghost" onPress={() => setMode('browse')} />
          </View>
        </View>
      );
    }

    const total = kanjiList!.length;
    const progress = ((practice.index) / total) * 100;

    return (
      <View style={styles.practiceContainer}>
        {/* Progress bar */}
        <View style={styles.practiceProgress}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Caption color="textMuted">{practice.index + 1} / {total}</Caption>
        </View>

        {/* Card */}
        <View style={styles.practiceCardArea}>
          <Card variant="elevated" style={styles.practiceCard}>
            <Text style={styles.practiceCharacter}>{currentKanji.character}</Text>

            {!practice.revealed ? (
              <Button title="Reveal" onPress={revealCard} />
            ) : (
              <View style={styles.revealedContent}>
                <View style={styles.readings}>
                  {currentKanji.onyomi.length > 0 && (
                    <Body align="center" color="textSecondary">
                      音読み: {currentKanji.onyomi.join('・')}
                    </Body>
                  )}
                  {currentKanji.kunyomi.length > 0 && (
                    <Body align="center" color="textSecondary">
                      訓読み: {currentKanji.kunyomi.join('・')}
                    </Body>
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

        {/* Score */}
        <View style={styles.scoreRow}>
          <View style={[styles.scoreBadge, styles.scoreBadgeCorrect]}>
            <Caption color="success">✓ {practice.correct}</Caption>
          </View>
          <View style={[styles.scoreBadge, styles.scoreBadgeIncorrect]}>
            <Caption color="error">✗ {practice.incorrect}</Caption>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={mode === 'practice' ? () => setMode('browse') : () => navigation.goBack()}>
          <Text color="primary">← {mode === 'practice' ? 'Browse' : 'Back'}</Text>
        </TouchableOpacity>
        <Heading2>Kanji</Heading2>
        <View style={{ width: 48 }} />
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
          <Body color="textSecondary" align="center">
            {(error as Error)?.message ?? 'Unknown error'}
          </Body>
        </View>
      ) : !kanjiList || kanjiList.length === 0 ? (
        renderEmpty()
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

  // Browse mode
  browseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  front: { alignItems: 'center', gap: spacing.xs },
  back: { alignItems: 'center', gap: spacing.xs },
  backHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  character: { fontSize: 52, lineHeight: 60, color: colors.textPrimary },
  characterSmall: { fontSize: 32, lineHeight: 38, color: colors.textPrimary },
  readings: { alignItems: 'center', gap: 2 },

  // Practice mode
  practiceContainer: { flex: 1, padding: layout.screenPaddingHorizontal },
  practiceProgress: { paddingVertical: spacing.md, gap: spacing.xs },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  practiceCardArea: { flex: 1, justifyContent: 'center' },
  practiceCard: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  practiceCharacter: { fontSize: 96, lineHeight: 108, color: colors.textPrimary },
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
  gradeBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  gradeBtnIncorrect: { backgroundColor: colors.errorMuted ?? '#fde8e8' },
  gradeBtnCorrect: { backgroundColor: colors.successMuted ?? '#e8f5e9' },
  gradeBtnText: { fontSize: 16, fontWeight: '600' },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  scoreBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  scoreBadgeCorrect: { backgroundColor: colors.successMuted ?? '#e8f5e9' },
  scoreBadgeIncorrect: { backgroundColor: colors.errorMuted ?? '#fde8e8' },
  doneActions: { gap: spacing.md, width: '100%', marginTop: spacing.md },
});

export default KanjiPracticeScreen;
