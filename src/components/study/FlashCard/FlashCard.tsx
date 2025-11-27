/**
 * FlashCard Component
 * 
 * Interactive flashcard with flip animation for vocabulary review.
 * Supports recognition (JP → EN) and recall (EN → JP) modes.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Platform,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Text, Button, Caption, Icon } from '@/components/shared';
import { colors, spacing, borderRadius, layout } from '@/theme';
import { speakJapanese, isTTSAvailable, playSound } from '@/services';
import type { StudyCard } from '@/types';

export type CardMode = 'recognition' | 'recall';

interface FlashCardProps {
  card: StudyCard;
  mode: CardMode;
  showAnswer: boolean;
  userAnswer?: string;
  onFlip: () => void;
  onAnswerChange?: (answer: string) => void;
  onSubmitAnswer?: () => void;
}

export function FlashCard({
  card,
  mode,
  showAnswer,
  userAnswer = '',
  onFlip,
  onAnswerChange,
  onSubmitAnswer,
}: FlashCardProps) {
  const flipProgress = useSharedValue(0);
  const cardScale = useSharedValue(1);

  // Animate flip with spring and sound
  React.useEffect(() => {
    if (showAnswer) {
      // Play flip sound
      playSound('flip');
      
      // Scale down slightly, flip, then scale back
      cardScale.value = withSpring(0.95, { damping: 15 });
      flipProgress.value = withTiming(1, {
        duration: 400,
        easing: Easing.inOut(Easing.cubic),
      }, () => {
        cardScale.value = withSpring(1, { damping: 12 });
      });
    } else {
      flipProgress.value = withTiming(0, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
    }
  }, [showAnswer, flipProgress, cardScale]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
    return {
      transform: [
        { scale: cardScale.value },
        { rotateY: `${rotateY}deg` },
      ],
      backfaceVisibility: 'hidden',
    };
  });
  
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const { vocab } = card;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const ttsAvailable = isTTSAvailable();

  // Handle TTS
  const handleSpeak = useCallback(async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      // Speak the term, then reading if different
      await speakJapanese(vocab.term);
      if (vocab.term !== vocab.reading) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await speakJapanese(vocab.reading);
      }
    } catch (error) {
      console.log('[TTS] Error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [vocab.term, vocab.reading, isSpeaking]);

  // Front content based on mode
  const renderFront = () => {
    if (mode === 'recognition') {
      // Show Japanese term, user must know English meaning
      return (
        <>
          <View style={styles.termRow}>
            <Text variant="japaneseLarge" align="center" style={styles.term}>
              {vocab.term}
            </Text>
            {ttsAvailable && (
              <Pressable 
                onPress={handleSpeak} 
                style={[styles.speakButton, isSpeaking && styles.speakButtonActive]}
              >
                <Text style={styles.speakIcon}>🔊</Text>
              </Pressable>
            )}
          </View>
          {vocab.term !== vocab.reading && (
            <Text variant="japanese" color="textSecondary" align="center">
              {vocab.reading}
            </Text>
          )}
          <View style={styles.promptContainer}>
            <Caption align="center">Tap to reveal meaning</Caption>
          </View>
        </>
      );
    } else {
      // Show English meaning, user must type Japanese
      return (
        <>
          <Text variant="h2" align="center" style={styles.meaning}>
            {vocab.meaning}
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userAnswer}
              onChangeText={onAnswerChange}
              placeholder="Type in Japanese..."
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => {
                Keyboard.dismiss();
                onSubmitAnswer?.();
              }}
            />
            <Button
              title="Check"
              size="medium"
              onPress={() => {
                Keyboard.dismiss();
                onSubmitAnswer?.();
              }}
              disabled={!userAnswer.trim()}
            />
          </View>
        </>
      );
    }
  };

  // Back content (answer)
  const renderBack = () => (
    <>
      <View style={styles.termRow}>
        <Text variant="japaneseLarge" align="center" style={styles.term}>
          {vocab.term}
        </Text>
        {ttsAvailable && (
          <Pressable 
            onPress={handleSpeak} 
            style={[styles.speakButton, isSpeaking && styles.speakButtonActive]}
          >
            <Text style={styles.speakIcon}>🔊</Text>
          </Pressable>
        )}
      </View>
      {vocab.term !== vocab.reading && (
        <Text variant="japanese" color="textSecondary" align="center" style={styles.reading}>
          {vocab.reading}
        </Text>
      )}
      <View style={styles.meaningContainer}>
        <Text variant="h3" align="center" color="primary">
          {vocab.meaning}
        </Text>
        {vocab.synonyms && vocab.synonyms.length > 0 && (
          <Caption align="center" style={styles.synonyms}>
            Also: {vocab.synonyms.slice(0, 3).join(', ')}
          </Caption>
        )}
      </View>
      {vocab.exampleJapanese && (
        <View style={styles.example}>
          <Text variant="japanese" align="center" style={styles.exampleJp}>
            {vocab.exampleJapanese}
          </Text>
          <Caption align="center">{vocab.exampleEnglish}</Caption>
        </View>
      )}
    </>
  );

  // In recall mode, show submit UI instead of flip
  if (mode === 'recall' && !showAnswer) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>{renderFront()}</View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.95}
      onPress={onFlip}
      disabled={showAnswer}
    >
      {/* Front */}
      <Animated.View style={[styles.card, styles.cardFace, frontAnimatedStyle]}>
        {renderFront()}
      </Animated.View>

      {/* Back */}
      <Animated.View style={[styles.card, styles.cardFace, styles.cardBack, backAnimatedStyle]}>
        {renderBack()}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    perspective: 1000,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardBack: {
    backgroundColor: colors.surfaceElevated,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  term: {
    // No margin needed, handled by termRow
  },
  speakButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakButtonActive: {
    backgroundColor: colors.primaryMuted,
  },
  speakIcon: {
    fontSize: 20,
  },
  reading: {
    marginBottom: spacing.lg,
  },
  meaning: {
    marginBottom: spacing.xl,
  },
  meaningContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  synonyms: {
    marginTop: spacing.sm,
  },
  promptContainer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputContainer: {
    width: '100%',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  example: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  exampleJp: {
    marginBottom: spacing.xs,
  },
});

export default FlashCard;

