/**
 * Vocabulary Browser Screen
 * 
 * Browse and search vocabulary by JLPT level.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card, Text, Heading2, Caption } from '@/components/shared';
import { Icon } from '@/components/shared';
import { colors, spacing, layout, borderRadius } from '@/theme';
import { useAuthStore } from '@/store';
import { getVocabByLevel, getUserProgress, updateProgress } from '@/api';
import { speakJapanese, isTTSAvailable } from '@/services';
import { DEFAULT_SRS_VALUES } from '@/services/srs';
import type { StudyScreenProps, Vocabulary, JlptLevel } from '@/types';

const JLPT_LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

export function VocabBrowserScreen({ navigation, route }: StudyScreenProps<'VocabBrowser'>) {
  const user = useAuthStore(state => state.user);
  const initialLevel = route.params?.level || user?.currentLevel || 'N5';
  
  const [selectedLevel, setSelectedLevel] = useState<JlptLevel>(initialLevel as JlptLevel);
  const [searchQuery, setSearchQuery] = useState('');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const ttsAvailable = isTTSAvailable();
  const isPremium = user?.subscriptionStatus === 'premium';

  // Track which vocab IDs are already in the user's deck
  const { data: userProgress } = useQuery({
    queryKey: ['userProgress', user?.uid],
    queryFn: () => user?.uid ? getUserProgress(user.uid) : Promise.resolve(new Map()),
    enabled: !!user?.uid,
    staleTime: 60 * 1000,
  });
  const [localAdded, setLocalAdded] = useState<Set<string>>(new Set());
  const isInDeck = (id: string) => localAdded.has(id) || userProgress?.has(id) || false;

  const { data: vocabulary, isLoading, error } = useQuery({
    queryKey: ['vocabulary', selectedLevel],
    queryFn: () => getVocabByLevel(selectedLevel),
    staleTime: 10 * 60 * 1000,
    enabled: isPremium || selectedLevel === 'N5',
  });

  // Filter vocabulary by search query
  const filteredVocab = useMemo(() => {
    if (!vocabulary) return [];
    if (!searchQuery.trim()) return vocabulary;
    
    const query = searchQuery.toLowerCase().trim();
    return vocabulary.filter(v => 
      v.term.includes(query) ||
      v.reading.includes(query) ||
      v.meaning.toLowerCase().includes(query) ||
      v.synonyms?.some(s => s.toLowerCase().includes(query))
    );
  }, [vocabulary, searchQuery]);

  const handleSpeak = useCallback(async (vocab: Vocabulary) => {
    if (speakingId) return;
    setSpeakingId(vocab.id);
    try {
      await speakJapanese(vocab.term);
      if (vocab.term !== vocab.reading) {
        await new Promise(resolve => setTimeout(resolve, 300));
        await speakJapanese(vocab.reading);
      }
    } catch (err) {
      console.log('[TTS] Error:', err);
    } finally {
      setSpeakingId(null);
    }
  }, [speakingId]);

  const handleAddToDeck = useCallback(async (vocab: Vocabulary) => {
    if (!user?.uid || addingId || isInDeck(vocab.id)) return;
    setAddingId(vocab.id);
    try {
      await updateProgress(user.uid, vocab.id, {
        vocabId: vocab.id,
        ...DEFAULT_SRS_VALUES,
        nextReview: new Date(),
        status: 'new',
        correctCount: 0,
        incorrectCount: 0,
      });
      setLocalAdded(prev => new Set(prev).add(vocab.id));
    } catch (err) {
      console.error('[VocabBrowser] Failed to add card:', err);
    } finally {
      setAddingId(null);
    }
  }, [user?.uid, addingId, userProgress, localAdded]);

  const renderVocabItem = ({ item }: { item: Vocabulary }) => {
    const added = isInDeck(item.id);
    const adding = addingId === item.id;
    return (
    <Card padding="medium" style={styles.vocabCard}>
      <View style={styles.vocabContent}>
        <View style={styles.vocabMain}>
          <View style={styles.termRow}>
            <Text variant="japaneseLarge" style={styles.term}>{item.term}</Text>
            {ttsAvailable && (
              <Pressable
                onPress={() => handleSpeak(item)}
                style={[styles.speakBtn, speakingId === item.id && styles.speakBtnActive]}
              >
                <Text style={styles.speakIcon}>🔊</Text>
              </Pressable>
            )}
          </View>
          {item.term !== item.reading && (
            <Text variant="japanese" color="textSecondary">{item.reading}</Text>
          )}
          <Text variant="body" color="primary" style={styles.meaning}>{item.meaning}</Text>
          {item.synonyms && item.synonyms.length > 0 && (
            <Caption color="textMuted">Also: {item.synonyms.slice(0, 2).join(', ')}</Caption>
          )}
        </View>
        <View style={styles.cardActions}>
          {item.partOfSpeech && (
            <View style={styles.posBadge}>
              <Caption color="textMuted">{item.partOfSpeech}</Caption>
            </View>
          )}
          <Pressable
            onPress={() => handleAddToDeck(item)}
            disabled={added || adding}
            style={[styles.addBtn, added && styles.addBtnAdded]}
          >
            {adding
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Text style={[styles.addBtnText, added && styles.addBtnTextAdded]}>
                  {added ? '✓' : '+'}
                </Text>
            }
          </Pressable>
        </View>
      </View>
      {item.exampleJapanese && (
        <View style={styles.example}>
          <Text variant="japanese" color="textSecondary" style={styles.exampleJp}>
            {item.exampleJapanese}
          </Text>
          <Caption color="textMuted">{item.exampleEnglish}</Caption>
        </View>
      )}
    </Card>
  );
  };

  const renderLevelTab = (level: JlptLevel) => {
    const isLocked = !isPremium && level !== 'N5';
    const isSelected = selectedLevel === level;
    
    return (
      <Pressable
        key={level}
        onPress={() => !isLocked && setSelectedLevel(level)}
        style={[
          styles.levelTab,
          isSelected && styles.levelTabSelected,
          isLocked && styles.levelTabLocked,
        ]}
      >
        <Text
          variant="label"
          color={isSelected ? 'primary' : isLocked ? 'textMuted' : 'textSecondary'}
        >
          {level}
        </Text>
        {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text color="primary">← Back</Text>
        </TouchableOpacity>
        <Heading2>Vocabulary</Heading2>
        <View style={styles.headerRight} />
      </View>

      {/* Level Tabs */}
      <View style={styles.levelTabs}>
        {JLPT_LEVELS.map(renderLevelTab)}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="book" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vocabulary..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <Caption color="textMuted" style={styles.resultCount}>
          {filteredVocab.length} word{filteredVocab.length !== 1 ? 's' : ''}
        </Caption>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Caption>Loading vocabulary...</Caption>
        </View>
      ) : error ? (
        <View style={styles.loading}>
          <Text color="error">Failed to load vocabulary</Text>
        </View>
      ) : !isPremium && selectedLevel !== 'N5' ? (
        <View style={styles.locked}>
          <Text style={styles.lockEmoji}>🔒</Text>
          <Text variant="h3" align="center">{selectedLevel} Vocabulary</Text>
          <Caption align="center" color="textSecondary">
            Unlock {selectedLevel} and higher levels with Premium
          </Caption>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text color="primary">Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>
      ) : filteredVocab.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="book" size={48} color={colors.textMuted} />
          <Text variant="h3" align="center" color="textSecondary">
            {searchQuery ? 'No matches found' : 'No vocabulary yet'}
          </Text>
          <Caption align="center">
            {searchQuery ? 'Try a different search term' : `${selectedLevel} vocabulary coming soon!`}
          </Caption>
        </View>
      ) : (
        <FlatList
          data={filteredVocab}
          renderItem={renderVocabItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 60,
  },
  headerRight: {
    width: 60,
  },
  levelTabs: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  levelTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  levelTabSelected: {
    backgroundColor: colors.primaryMuted,
  },
  levelTabLocked: {
    opacity: 0.6,
  },
  lockIcon: {
    fontSize: 10,
  },
  searchContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
  },
  resultCount: {
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  locked: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  lockEmoji: {
    fontSize: 48,
  },
  upgradeButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.lg,
  },
  list: {
    padding: layout.screenPaddingHorizontal,
    paddingBottom: spacing['4xl'],
  },
  separator: {
    height: spacing.sm,
  },
  vocabCard: {
    gap: spacing.sm,
  },
  vocabContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vocabMain: {
    flex: 1,
    gap: spacing.xs,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  term: {
    fontSize: 24,
  },
  speakBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakBtnActive: {
    backgroundColor: colors.primaryMuted,
  },
  speakIcon: {
    fontSize: 16,
  },
  meaning: {
    marginTop: spacing.xs,
  },
  cardActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  posBadge: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnAdded: {
    backgroundColor: colors.surfaceHighlight,
  },
  addBtnText: {
    fontSize: 18,
    lineHeight: 22,
    color: colors.primary,
    fontWeight: '600',
  },
  addBtnTextAdded: {
    color: colors.success,
    fontSize: 16,
  },
  example: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  exampleJp: {
    fontSize: 14,
  },
});

export default VocabBrowserScreen;

