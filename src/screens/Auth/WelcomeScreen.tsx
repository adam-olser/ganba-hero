/**
 * Welcome Screen
 * 
 * First screen users see - app intro with sign-in options.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, Heading1, Body } from '@/components/shared';
import { colors, spacing, layout } from '@/theme';
import { signInWithGoogle, signInWithApple, signInAnonymously } from '@/api/auth';
import type { AuthScreenProps } from '@/types';

export function WelcomeScreen({ navigation }: AuthScreenProps<'Welcome'>) {
  const [isLoading, setIsLoading] = useState<'google' | 'apple' | 'guest' | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading('google');
    try {
      await signInWithGoogle();
      // Navigation will happen automatically via auth state listener
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      Alert.alert('Sign In Failed', error.message || 'Could not sign in with Google');
    } finally {
      setIsLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading('apple');
    try {
      await signInWithApple();
      // Navigation will happen automatically via auth state listener
    } catch (error: any) {
      console.error('Apple Sign-In error:', error);
      Alert.alert('Sign In Failed', error.message || 'Could not sign in with Apple');
    } finally {
      setIsLoading(null);
    }
  };

  const handleGuestMode = async () => {
    setIsLoading('guest');
    try {
      await signInAnonymously();
      // Navigation will happen automatically via auth state listener
    } catch (error: any) {
      console.error('Guest mode error:', error);
      Alert.alert('Error', error.message || 'Could not start guest mode');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Mascot Area */}
        <View style={styles.hero}>
          <View style={styles.mascotPlaceholder}>
            <Text variant="japaneseLarge" align="center">🦐</Text>
          </View>
          <Heading1 align="center">Ganba Hero</Heading1>
          <Body color="textSecondary" align="center" style={styles.tagline}>
            Master Japanese with spaced repetition
          </Body>
        </View>

        {/* Sign In Options */}
        <View style={styles.authButtons}>
          <Button
            title="Continue with Google"
            variant="secondary"
            size="large"
            fullWidth
            loading={isLoading === 'google'}
            disabled={isLoading !== null}
            onPress={handleGoogleSignIn}
          />
          
          {Platform.OS === 'ios' && (
            <Button
              title="Continue with Apple"
              variant="secondary"
              size="large"
              fullWidth
              loading={isLoading === 'apple'}
              disabled={isLoading !== null}
              onPress={handleAppleSignIn}
            />
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text variant="caption" color="textMuted" style={styles.dividerText}>
              or
            </Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Try as Guest"
            variant="ghost"
            size="large"
            fullWidth
            loading={isLoading === 'guest'}
            disabled={isLoading !== null}
            onPress={handleGuestMode}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="caption" color="textMuted" align="center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: layout.screenPaddingVertical,
    justifyContent: 'space-between',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  mascotPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tagline: {
    marginTop: spacing.sm,
  },
  authButtons: {
    gap: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: spacing.sm,
  },
  footer: {
    marginTop: spacing.xl,
    paddingBottom: spacing.md,
  },
});

export default WelcomeScreen;

