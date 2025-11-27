/**
 * Session Results Modal
 * 
 * Displays results after completing a study session.
 */

import React from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { Card, Text, Heading2, Body, Caption, Button } from '@/components/shared';
import { Icon } from '@/components/shared';
import { colors, spacing, borderRadius, layout } from '@/theme';
import { StudySession } from '@/types';
import { calculateXP } from '@/services/xpCalculator';

interface SessionResultsProps {
  visible: boolean;
  session: StudySession | null;
  onClose: () => void;
  onContinue?: () => void;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: 'star' | 'flame' | 'check';
  color?: string;
}

function StatCard({ label, value, icon, color = colors.textPrimary }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      {icon && (
        <Icon name={icon} size={20} color={color} />
      )}
      <Text variant="h3" style={{ color }}>{value}</Text>
      <Caption color="textMuted">{label}</Caption>
    </View>
  );
}

export function SessionResults({ visible, session, onClose, onContinue }: SessionResultsProps) {
  if (!session) return null;
  
  const totalCards = session.results.length;
  const correctAnswers = session.results.filter(r => r.correct).length;
  const accuracy = totalCards > 0 ? Math.round((correctAnswers / totalCards) * 100) : 0;
  const newCardsLearned = session.results.filter(r => session.queue.find(c => c.vocab.id === r.vocabId)?.isNew && r.correct).length;
  
  // Calculate XP
  const xpEarned = calculateXP({
    cardsReviewed: totalCards,
    correctAnswers,
    newCardsLearned,
    perfectSession: accuracy === 100,
    streakBonus: false, // TODO: Check actual streak
  });
  
  // Determine message based on accuracy
  const getMessage = () => {
    if (accuracy === 100) return { title: 'Perfect! 🎉', subtitle: 'You nailed every card!' };
    if (accuracy >= 80) return { title: 'Great Job! 💪', subtitle: 'Keep up the awesome work!' };
    if (accuracy >= 60) return { title: 'Good Progress! 📈', subtitle: 'Practice makes perfect!' };
    return { title: 'Keep Going! 🌱', subtitle: "Every mistake is a learning opportunity!" };
  };
  
  const { title, subtitle } = getMessage();
  
  // Calculate session duration
  const durationMs = session.endedAt && session.startedAt
    ? session.endedAt.getTime() - session.startedAt.getTime()
    : 0;
  const durationMinutes = Math.max(1, Math.round(durationMs / 60000));
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={e => e.stopPropagation()}>
          <Card variant="elevated" style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Heading2 style={styles.title}>{title}</Heading2>
              <Body color="textSecondary" align="center">{subtitle}</Body>
            </View>
            
            {/* XP Display */}
            <View style={styles.xpContainer}>
              <View style={styles.xpBadge}>
                <Icon name="star" size={24} color={colors.primary} />
                <Text variant="h2" style={styles.xpValue}>+{xpEarned}</Text>
                <Caption color="textMuted">XP Earned</Caption>
              </View>
            </View>
            
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                label="Accuracy"
                value={`${accuracy}%`}
                icon="check"
                color={accuracy >= 80 ? colors.success : accuracy >= 60 ? colors.warning : colors.error}
              />
              <StatCard
                label="Cards"
                value={totalCards}
              />
              <StatCard
                label="Correct"
                value={correctAnswers}
                color={colors.success}
              />
              <StatCard
                label="New Learned"
                value={newCardsLearned}
                color={colors.primary}
              />
            </View>
            
            {/* Duration */}
            <View style={styles.durationContainer}>
              <Caption color="textMuted">
                Session completed in {durationMinutes} minute{durationMinutes !== 1 ? 's' : ''}
              </Caption>
            </View>
            
            {/* Actions */}
            <View style={styles.actions}>
              {onContinue && (
                <Button
                  title="Continue Studying"
                  variant="secondary"
                  size="medium"
                  onPress={onContinue}
                  style={styles.continueButton}
                />
              )}
              <Button
                title="Done"
                variant="primary"
                size="large"
                fullWidth
                onPress={onClose}
              />
            </View>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  xpContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  xpBadge: {
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.lg,
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.xl,
    minWidth: 140,
  },
  xpValue: {
    color: colors.primary,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.md,
  },
  durationContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  continueButton: {
    marginBottom: spacing.xs,
  },
});

export default SessionResults;

