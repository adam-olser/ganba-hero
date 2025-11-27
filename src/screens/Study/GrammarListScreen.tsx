/**
 * Grammar List Screen
 * 
 * Lists all grammar points for the user's current level.
 */

import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card, Text, Heading2, Caption } from '@/components/shared';
import { Icon } from '@/components/shared';
import { colors, spacing, layout, borderRadius } from '@/theme';
import { useAuthStore } from '@/store';
import { getGrammarByLevel } from '@/api';
import type { StudyScreenProps, GrammarPoint } from '@/types';

export function GrammarListScreen({ navigation }: StudyScreenProps<'LessonList'>) {
  const user = useAuthStore(state => state.user);
  const level = user?.currentLevel || 'N5';

  const { data: grammarPoints, isLoading, error } = useQuery({
    queryKey: ['grammar', level],
    queryFn: () => getGrammarByLevel(level),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handlePressGrammar = (grammar: GrammarPoint) => {
    navigation.navigate('LessonDetail', { grammarId: grammar.id });
  };

  const renderGrammarItem = ({ item, index }: { item: GrammarPoint; index: number }) => (
    <TouchableOpacity
      onPress={() => handlePressGrammar(item)}
      activeOpacity={0.7}
    >
      <Card padding="medium" style={styles.grammarCard}>
        <View style={styles.grammarContent}>
          <View style={styles.grammarNumber}>
            <Text variant="caption" color="textMuted">{index + 1}</Text>
          </View>
          <View style={styles.grammarInfo}>
            <Text variant="japaneseLarge" style={styles.pattern}>{item.pattern}</Text>
            <Text variant="body" color="textSecondary">{item.meaning}</Text>
            {item.tags && item.tags.length > 0 && (
              <View style={styles.tags}>
                {item.tags.slice(0, 3).map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Caption color="textMuted">{tag}</Caption>
                  </View>
                ))}
              </View>
            )}
          </View>
          <Icon name="book" size={20} color={colors.textMuted} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Caption>Loading grammar points...</Caption>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !grammarPoints) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}>
          <Text variant="body" color="error">Failed to load grammar points</Text>
          <Caption>Please try again later</Caption>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text color="primary">← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Heading2>Grammar</Heading2>
          <Caption>{level} • {grammarPoints.length} patterns</Caption>
        </View>
        <View style={styles.headerRight} />
      </View>

      {grammarPoints.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="book" size={48} color={colors.textMuted} />
          <Text variant="h3" align="center" color="textSecondary">
            No grammar points yet
          </Text>
          <Caption align="center">
            Grammar lessons for {level} are coming soon!
          </Caption>
        </View>
      ) : (
        <FlatList
          data={grammarPoints}
          renderItem={renderGrammarItem}
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
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 60,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerRight: {
    width: 60,
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
  list: {
    padding: layout.screenPaddingHorizontal,
    paddingBottom: spacing['4xl'],
  },
  separator: {
    height: spacing.sm,
  },
  grammarCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  grammarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  grammarNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grammarInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  pattern: {
    fontSize: 20,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tag: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
});

export default GrammarListScreen;

