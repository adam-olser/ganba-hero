/**
 * Flashcard Session Screen
 * 
 * The core study experience - review vocabulary cards with SRS grading.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Caption } from '@/components/shared';
import { FlashCard, GradeButtons, CardMode, SessionResults } from '@/components/study';
import { colors, spacing, borderRadius } from '@/theme';
import { useStudyStore, selectCurrentCard, selectSessionProgress, selectSessionStats } from '@/store';
import { Quality } from '@/services/srs';
import { checkAnswer } from '@/services/inputNormalizer';
import type { StudyScreenProps, ReviewResult, StudySession } from '@/types';

export function FlashcardSessionScreen({ navigation }: StudyScreenProps<'FlashcardSession'>) {
  const session = useStudyStore(state => state.session);
  const currentCard = useStudyStore(selectCurrentCard);
  const progress = useStudyStore(selectSessionProgress);
  const stats = useStudyStore(selectSessionStats);
  const recordResult = useStudyStore(state => state.recordResult);
  const nextCard = useStudyStore(state => state.nextCard);
  const endSession = useStudyStore(state => state.endSession);

  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [answerStartTime, setAnswerStartTime] = useState(Date.now());
  const [showResults, setShowResults] = useState(false);
  const [completedSession, setCompletedSession] = useState<StudySession | null>(null);

  // Determine mode from session
  const mode: CardMode = session?.mode === 'recall' ? 'recall' : 'recognition';

  // Handle card flip
  const handleFlip = useCallback(() => {
    if (!showAnswer) {
      setShowAnswer(true);
    }
  }, [showAnswer]);

  // Handle typed answer submission (recall mode)
  const handleSubmitAnswer = useCallback(() => {
    if (!currentCard || !userAnswer.trim()) return;

    const isCorrect = checkAnswer(
      userAnswer,
      currentCard.vocab.term,
      currentCard.vocab.reading,
      currentCard.vocab.readingSynonyms
    );

    setShowAnswer(true);

    // Auto-grade based on correctness in recall mode
    // If correct, treat as quality 4 (good), if wrong, quality 1 (again)
    // User can still override with grade buttons
  }, [currentCard, userAnswer]);

  // Handle grading
  const handleGrade = useCallback((quality: Quality) => {
    if (!currentCard) return;

    const timeTaken = Date.now() - answerStartTime;
    
    // Check if answer was correct (for recall mode)
    const isCorrect = mode === 'recall'
      ? checkAnswer(
          userAnswer,
          currentCard.vocab.term,
          currentCard.vocab.reading,
          currentCard.vocab.readingSynonyms
        )
      : quality >= 3;

    const result: ReviewResult = {
      vocabId: currentCard.vocab.id,
      correct: isCorrect,
      answerGiven: mode === 'recall' ? userAnswer : '',
      timeTakenMs: timeTaken,
      quality,
    };

    recordResult(result);

    // Check if session is complete
    if (progress.current >= progress.total) {
      handleEndSession();
      return;
    }

    // Move to next card
    nextCard();
    setShowAnswer(false);
    setUserAnswer('');
    setAnswerStartTime(Date.now());
  }, [currentCard, mode, userAnswer, answerStartTime, progress, recordResult, nextCard]);

  // Handle session end
  const handleEndSession = useCallback(() => {
    const finished = endSession();
    if (finished) {
      setCompletedSession(finished);
      setShowResults(true);
    }
  }, [endSession]);

  // Handle closing results modal
  const handleCloseResults = useCallback(() => {
    setShowResults(false);
    setCompletedSession(null);
    navigation.goBack();
  }, [navigation]);

  // Handle continuing to study more
  const handleContinueStudying = useCallback(() => {
    setShowResults(false);
    setCompletedSession(null);
    navigation.goBack();
    // Could navigate to start a new session here
  }, [navigation]);

  // Handle quit early
  const handleQuit = useCallback(() => {
    Alert.alert(
      'End Session?',
      'Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Session', onPress: handleEndSession },
      ]
    );
  }, [handleEndSession]);

  // No session active
  if (!session || !currentCard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text variant="h3" align="center">No cards to review</Text>
          <Caption align="center">Start a new session from the Study tab</Caption>
          <Button
            title="Go Back"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          title="×"
          variant="ghost"
          size="small"
          onPress={handleQuit}
          textStyle={styles.closeButton}
        />
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress.percentage}%` },
              ]}
            />
          </View>
          <Caption>{progress.current} / {progress.total}</Caption>
        </View>
        {stats && (
          <Caption color="success">{stats.accuracy}%</Caption>
        )}
      </View>

      {/* Card */}
      <View style={styles.cardContainer}>
        <FlashCard
          card={currentCard}
          mode={mode}
          showAnswer={showAnswer}
          userAnswer={userAnswer}
          onFlip={handleFlip}
          onAnswerChange={setUserAnswer}
          onSubmitAnswer={handleSubmitAnswer}
        />
      </View>

      {/* Grade Buttons */}
      {showAnswer && (
        <View style={styles.gradeContainer}>
          <GradeButtons onGrade={handleGrade} />
        </View>
      )}

      {/* New card indicator */}
      {currentCard.isNew && !showAnswer && (
        <View style={styles.newBadge}>
          <Text variant="caption" color="primary">NEW</Text>
        </View>
      )}

      {/* Session Results Modal */}
      <SessionResults
        visible={showResults}
        session={completedSession}
        onClose={handleCloseResults}
        onContinue={handleContinueStudying}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  cardContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  gradeContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  backButton: {
    marginTop: spacing.lg,
  },
  newBadge: {
    position: 'absolute',
    top: 80,
    right: spacing.lg,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
});

export default FlashcardSessionScreen;

