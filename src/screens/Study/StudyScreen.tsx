/**
 * Study Screen
 * 
 * Main study hub with flashcard session, lessons, and kana chart.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, Text, Heading2, Heading3, Body, Caption } from '@/components/shared';
import { colors, spacing, layout, borderRadius } from '@/theme';
import { useAuthStore, useStudyStore, selectDailyProgress } from '@/store';
import { getVocabByLevel, getDueCards, getVocabByIds } from '@/api';
import type { StudyScreenProps, StudyCard, StudyStackParamList } from '@/types';
import type { StackNavigationProp } from '@react-navigation/stack';

type StudyNavProp = StackNavigationProp<StudyStackParamList, 'StudyHub'>;

export function StudyScreen() {
  const navigation = useNavigation<StudyNavProp>();
  const user = useAuthStore(state => state.user);
  const dailyProgress = useStudyStore(selectDailyProgress);
  const startSession = useStudyStore(state => state.startSession);
  const setLoading = useStudyStore(state => state.setLoading);
  const isLoading = useStudyStore(state => state.isLoading);
  
  const handleStartReview = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get due cards for review
      const dueProgress = await getDueCards(user.uid);
      
      // Get vocabulary for level
      const levelVocab = await getVocabByLevel(user.currentLevel || 'N5');
      
      // Create study cards - combine due reviews with new cards
      const studyCards: StudyCard[] = [];
      
      // Add due cards first
      for (const progress of dueProgress.slice(0, 20)) {
        const vocab = levelVocab.find(v => v.id === progress.vocabId);
        if (vocab) {
          studyCards.push({
            vocab: {
              id: vocab.id,
              term: vocab.term,
              reading: vocab.reading,
              meaning: vocab.meaning,
              synonyms: vocab.synonyms || [],
              readingSynonyms: vocab.readingSynonyms || [],
              exampleJapanese: vocab.exampleJapanese,
              exampleEnglish: vocab.exampleEnglish,
            },
            progress,
            isNew: false,
          });
        }
      }
      
      // Add new cards if we have room
      const newCardsNeeded = Math.max(0, (user.settings?.dailyNewCards || 5) - studyCards.length);
      const existingVocabIds = new Set(dueProgress.map(p => p.vocabId));
      
      const newVocab = levelVocab
        .filter(v => !existingVocabIds.has(v.id))
        .slice(0, newCardsNeeded);
      
      for (const vocab of newVocab) {
        studyCards.push({
          vocab: {
            id: vocab.id,
            term: vocab.term,
            reading: vocab.reading,
            meaning: vocab.meaning,
            synonyms: vocab.synonyms || [],
            readingSynonyms: vocab.readingSynonyms || [],
            exampleJapanese: vocab.exampleJapanese,
            exampleEnglish: vocab.exampleEnglish,
          },
          progress: null,
          isNew: true,
        });
      }
      
      if (studyCards.length === 0) {
        Alert.alert('All Done!', 'No cards due for review. Come back later!');
        return;
      }
      
      // Start session
      startSession(studyCards, 'recognition');
      
      // Navigate to session
      navigation.navigate('FlashcardSession', { mode: 'recognition' });
    } catch (error) {
      console.error('Error starting review:', error);
      Alert.alert('Error', 'Could not load cards. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, startSession, navigation, setLoading]);
  
  const handleStartLesson = () => {
    navigation.navigate('LessonList', { level: user?.currentLevel || 'N5' });
  };
  
  const handleOpenKanaChart = () => {
    navigation.navigate('KanaChart');
  };
  
  const handleOpenVocabBrowser = () => {
    navigation.navigate('VocabBrowser', { level: user?.currentLevel || 'N5' });
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
          <Heading2>Study</Heading2>
        </View>
        
        {/* Review Card */}
        <Card variant="elevated" style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Heading3>Daily Review</Heading3>
            <View style={styles.statsRow}>
              <View style={styles.statBadge}>
                <Text variant="label">0</Text>
                <Caption>Due</Caption>
              </View>
              <View style={styles.statBadge}>
                <Text variant="label">0</Text>
                <Caption>New</Caption>
              </View>
            </View>
          </View>
          
          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${dailyProgress.percentage}%` }
                ]} 
              />
            </View>
            <Caption>
              {dailyProgress.cardsStudiedToday} / {dailyProgress.dailyGoal} cards today
            </Caption>
          </View>
          
          <Button
            title="Start Review"
            size="large"
            fullWidth
            loading={isLoading}
            onPress={handleStartReview}
          />
        </Card>
        
        {/* Quick Actions */}
        <View style={styles.section}>
          <Heading3 style={styles.sectionTitle}>Quick Actions</Heading3>
          
          <View style={styles.actionGrid}>
            <Card
              padding="medium"
              style={styles.actionCard}
              onTouchEnd={handleOpenVocabBrowser}
            >
              <Text variant="japanese" align="center" style={styles.actionIcon}>
                📚
              </Text>
              <Text variant="label" align="center">Vocabulary</Text>
              <Caption align="center">Browse words</Caption>
            </Card>
            
            <Card
              padding="medium"
              style={styles.actionCard}
              onTouchEnd={handleStartLesson}
            >
              <Text variant="japanese" align="center" style={styles.actionIcon}>
                📖
              </Text>
              <Text variant="label" align="center">Grammar</Text>
              <Caption align="center">Learn patterns</Caption>
            </Card>
          </View>
          
          <View style={styles.actionGrid}>
            <Card
              padding="medium"
              style={styles.actionCard}
              onTouchEnd={handleOpenKanaChart}
            >
              <Text variant="japanese" align="center" style={styles.actionIcon}>
                あ
              </Text>
              <Text variant="label" align="center">Kana Chart</Text>
              <Caption align="center">Reference</Caption>
            </Card>
            
            <Card
              padding="medium"
              style={styles.actionCard}
              onTouchEnd={() => Alert.alert('Coming Soon', 'Kanji practice coming soon!')}
            >
              <Text variant="japanese" align="center" style={styles.actionIcon}>
                漢
              </Text>
              <Text variant="label" align="center">Kanji</Text>
              <Caption align="center">Coming soon</Caption>
            </Card>
          </View>
        </View>
        
        {/* Level Info */}
        <Card variant="default" padding="medium" style={styles.levelCard}>
          <View style={styles.levelContent}>
            <View>
              <Text variant="label">Current Level</Text>
              <Caption>{user?.currentLevel || 'N5'}</Caption>
            </View>
            <Button
              title="Change"
              variant="ghost"
              size="small"
              onPress={() => console.log('Change level')}
            />
          </View>
        </Card>
      </ScrollView>
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
  reviewCard: {
    padding: spacing.lg,
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBadge: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.md,
    minWidth: 60,
  },
  progressSection: {
    gap: spacing.sm,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionIcon: {
    fontSize: 32,
  },
  levelCard: {
    marginBottom: spacing.lg,
  },
  levelContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default StudyScreen;

