/**
 * Link Account Prompt
 * 
 * Prompts guest users to link their account to Google or Apple.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform, Alert, Modal, Pressable } from 'react-native';
import { Card, Text, Button, Heading3, Body, Caption } from '@/components/shared';
import { Icon } from '@/components/shared';
import { colors, spacing, borderRadius } from '@/theme';
import { linkWithGoogle, linkWithApple, isAnonymous } from '@/api';

interface LinkAccountPromptProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LinkAccountPrompt({ visible, onClose, onSuccess }: LinkAccountPromptProps) {
  const [isLoading, setIsLoading] = useState<'google' | 'apple' | null>(null);

  if (!isAnonymous()) {
    return null;
  }

  const handleLinkGoogle = async () => {
    setIsLoading('google');
    try {
      await linkWithGoogle();
      Alert.alert('Success!', 'Your account has been linked to Google.');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Google link error:', error);
      Alert.alert('Error', error.message || 'Failed to link with Google');
    } finally {
      setIsLoading(null);
    }
  };

  const handleLinkApple = async () => {
    setIsLoading('apple');
    try {
      await linkWithApple();
      Alert.alert('Success!', 'Your account has been linked to Apple.');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Apple link error:', error);
      Alert.alert('Error', error.message || 'Failed to link with Apple');
    } finally {
      setIsLoading(null);
    }
  };

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
              <Icon name="star" size={32} color={colors.primary} />
              <Heading3 style={styles.title}>Save Your Progress</Heading3>
              <Body color="textSecondary" align="center">
                Link your account to keep your progress, streak, and XP safe across devices.
              </Body>
            </View>

            {/* Benefits */}
            <View style={styles.benefits}>
              <View style={styles.benefitRow}>
                <Icon name="check" size={16} color={colors.success} />
                <Caption>Sync progress across devices</Caption>
              </View>
              <View style={styles.benefitRow}>
                <Icon name="check" size={16} color={colors.success} />
                <Caption>Protect your streak</Caption>
              </View>
              <View style={styles.benefitRow}>
                <Icon name="check" size={16} color={colors.success} />
                <Caption>Never lose your XP</Caption>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="Continue with Google"
                variant="secondary"
                size="large"
                fullWidth
                loading={isLoading === 'google'}
                disabled={isLoading !== null && isLoading !== 'google'}
                onPress={handleLinkGoogle}
              />
              
              {Platform.OS === 'ios' && (
                <Button
                  title="Continue with Apple"
                  variant="secondary"
                  size="large"
                  fullWidth
                  loading={isLoading === 'apple'}
                  disabled={isLoading !== null && isLoading !== 'apple'}
                  onPress={handleLinkApple}
                />
              )}

              <Button
                title="Not Now"
                variant="ghost"
                size="medium"
                fullWidth
                onPress={onClose}
              />
            </View>

            <Caption color="textMuted" align="center">
              Guest progress will be lost if you uninstall the app
            </Caption>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * Inline banner version for Settings screen
 */
export function LinkAccountBanner({ onPress }: { onPress: () => void }) {
  if (!isAnonymous()) {
    return null;
  }

  return (
    <Card variant="outlined" style={styles.banner} onTouchEnd={onPress}>
      <View style={styles.bannerContent}>
        <Icon name="star" size={20} color={colors.primary} />
        <View style={styles.bannerText}>
          <Text variant="label" color="primary">Save Your Progress</Text>
          <Caption>Link your account to protect your data</Caption>
        </View>
        <Text color="textMuted">›</Text>
      </View>
    </Card>
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
  benefits: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.md,
  },
  banner: {
    borderColor: colors.primary,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bannerText: {
    flex: 1,
    gap: spacing.xs,
  },
});

export default LinkAccountPrompt;

