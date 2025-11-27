/**
 * Settings Screen
 * 
 * User preferences, subscription, account management.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, Heading2, Body, Caption } from '@/components/shared';
import { LinkAccountPrompt, LinkAccountBanner } from '@/components/auth';
import { colors, spacing, layout, borderRadius } from '@/theme';
import { useAuthStore, useSettingsStore } from '@/store';
import { signOut, deleteAccount, isAnonymous } from '@/api';
import type { SettingsScreenProps } from '@/types';

interface SettingRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

function SettingRow({ label, value, onPress, danger }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text variant="body" color={danger ? 'error' : 'textPrimary'}>{label}</Text>
      {value && (
        <Text variant="body" color="textSecondary">{value}</Text>
      )}
      {onPress && (
        <Text color="textMuted">›</Text>
      )}
    </TouchableOpacity>
  );
}

export function SettingsScreen({ navigation }: SettingsScreenProps<'SettingsMain'>) {
  const user = useAuthStore(state => state.user);
  const authSignOut = useAuthStore(state => state.signOut);
  const settings = useSettingsStore();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const isGuest = isAnonymous();
  
  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              authSignOut();
            } catch (error) {
              console.error('Sign out error:', error);
            }
          },
        },
      ]
    );
  };
  
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              authSignOut();
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Heading2>Settings</Heading2>
        </View>
        
        {/* Link Account Banner (for guest users) */}
        {isGuest && (
          <LinkAccountBanner onPress={() => setShowLinkModal(true)} />
        )}

        {/* Profile Section */}
        <View style={styles.section}>
          <Caption style={styles.sectionLabel}>PROFILE</Caption>
          <Card padding="none">
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text variant="japanese">🦐</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text variant="body">{user?.displayName || 'Learner'}</Text>
                <Caption>{isGuest ? 'Guest Account' : (user?.email || 'No email')}</Caption>
              </View>
            </View>
            {!isGuest && (
              <SettingRow
                label="Subscription"
                value={user?.subscriptionStatus === 'premium' ? 'Premium' : 'Free'}
                onPress={() => console.log('Open subscription')}
              />
            )}
          </Card>
        </View>
        
        {/* Study Preferences */}
        <View style={styles.section}>
          <Caption style={styles.sectionLabel}>STUDY PREFERENCES</Caption>
          <Card padding="none">
            <SettingRow
              label="Daily New Cards"
              value={`${settings.dailyNewCards} cards`}
              onPress={() => console.log('Change daily cards')}
            />
            <SettingRow
              label="Show Furigana"
              value={settings.showFurigana ? 'On' : 'Off'}
              onPress={() => settings.updateSettings({ showFurigana: !settings.showFurigana })}
            />
            <SettingRow
              label="Text-to-Speech"
              value={settings.ttsEnabled ? 'On' : 'Off'}
              onPress={() => settings.updateSettings({ ttsEnabled: !settings.ttsEnabled })}
            />
            <SettingRow
              label="Sound Effects"
              value={settings.soundEnabled ? 'On' : 'Off'}
              onPress={() => settings.updateSettings({ soundEnabled: !settings.soundEnabled })}
            />
          </Card>
        </View>
        
        {/* Notifications */}
        <View style={styles.section}>
          <Caption style={styles.sectionLabel}>NOTIFICATIONS</Caption>
          <Card padding="none">
            <SettingRow
              label="Daily Reminder"
              value={settings.notificationsEnabled ? settings.reminderTime : 'Off'}
              onPress={() => console.log('Change reminder')}
            />
          </Card>
        </View>
        
        {/* Privacy */}
        <View style={styles.section}>
          <Caption style={styles.sectionLabel}>PRIVACY</Caption>
          <Card padding="none">
            <SettingRow
              label="Enhanced Analytics"
              value={settings.enhancedAnalyticsEnabled ? 'On' : 'Off'}
              onPress={() => settings.updateSettings({
                enhancedAnalyticsEnabled: !settings.enhancedAnalyticsEnabled
              })}
            />
          </Card>
        </View>
        
        {/* About */}
        <View style={styles.section}>
          <Caption style={styles.sectionLabel}>ABOUT</Caption>
          <Card padding="none">
            <SettingRow
              label="Data Sources & Licenses"
              onPress={() => navigation.navigate('DataSources')}
            />
            <SettingRow
              label="Privacy Policy"
              onPress={() => console.log('Open privacy policy')}
            />
            <SettingRow
              label="Terms of Service"
              onPress={() => console.log('Open terms')}
            />
            <SettingRow
              label="Version"
              value="0.1.0"
            />
          </Card>
        </View>
        
        {/* Account */}
        <View style={styles.section}>
          <Caption style={styles.sectionLabel}>ACCOUNT</Caption>
          <Card padding="none">
            {isGuest && (
              <SettingRow
                label="Link Account"
                value="Save your progress"
                onPress={() => setShowLinkModal(true)}
              />
            )}
            <SettingRow
              label="Sign Out"
              onPress={handleSignOut}
            />
            <SettingRow
              label="Delete Account"
              onPress={handleDeleteAccount}
              danger
            />
          </Card>
        </View>
      </ScrollView>

      {/* Link Account Modal */}
      <LinkAccountPrompt
        visible={showLinkModal}
        onClose={() => setShowLinkModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: layout.screenPaddingHorizontal,
    paddingBottom: spacing['4xl'],
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
});

export default SettingsScreen;

