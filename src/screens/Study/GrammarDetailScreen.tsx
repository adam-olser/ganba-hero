/**
 * Grammar Detail Screen
 * 
 * Shows detailed information about a grammar point with examples.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card, Text, Heading2, Heading3, Body, Caption } from '@/components/shared';
import { Icon } from '@/components/shared';
import { colors, spacing, layout, borderRadius } from '@/theme';
import { getGrammarById } from '@/api';
import type { StudyScreenProps, GrammarPoint } from '@/types';

export function GrammarDetailScreen({ navigation, route }: StudyScreenProps<'LessonDetail'>) {
  const { grammarId } = route.params;

  const { data: grammar, isLoading, error } = useQuery({
    queryKey: ['grammarDetail', grammarId],
    queryFn: () => getGrammarById(grammarId),
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Caption>Loading grammar point...</Caption>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !grammar) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}>
          <Text variant="body" color="error">Failed to load grammar point</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text color="primary">Go back</Text>
          </TouchableOpacity>
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
          <Caption color="textMuted">{grammar.jlptLevel}</Caption>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Pattern */}
        <Card variant="elevated" style={styles.mainCard}>
          <Text variant="japaneseLarge" align="center" style={styles.pattern}>
            {grammar.pattern}
          </Text>
          <Text variant="h3" align="center" color="textSecondary">
            {grammar.meaning}
          </Text>
          {grammar.tags && grammar.tags.length > 0 && (
            <View style={styles.tags}>
              {grammar.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Caption color="primary">{tag}</Caption>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Explanation */}
        {grammar.explanation && (
          <View style={styles.section}>
            <Heading3 style={styles.sectionTitle}>Explanation</Heading3>
            <Card padding="medium">
              <Body color="textSecondary">{grammar.explanation}</Body>
            </Card>
          </View>
        )}

        {/* Formation */}
        {grammar.formation && (
          <View style={styles.section}>
            <Heading3 style={styles.sectionTitle}>Formation</Heading3>
            <Card padding="medium">
              <Text variant="japanese" style={styles.formation}>
                {grammar.formation}
              </Text>
            </Card>
          </View>
        )}

        {/* Examples */}
        {grammar.examples && grammar.examples.length > 0 && (
          <View style={styles.section}>
            <Heading3 style={styles.sectionTitle}>Examples</Heading3>
            <View style={styles.exampleList}>
              {grammar.examples.map((example, index) => (
                <Card key={index} padding="medium" style={styles.exampleCard}>
                  <View style={styles.exampleNumber}>
                    <Caption color="primary">{index + 1}</Caption>
                  </View>
                  <Text variant="japanese" style={styles.exampleJapanese}>
                    {example.japanese}
                  </Text>
                  {example.reading && (
                    <Caption color="textMuted" style={styles.exampleReading}>
                      {example.reading}
                    </Caption>
                  )}
                  <Body color="textSecondary" style={styles.exampleEnglish}>
                    {example.english}
                  </Body>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Related Grammar */}
        {grammar.relatedPatterns && grammar.relatedPatterns.length > 0 && (
          <View style={styles.section}>
            <Heading3 style={styles.sectionTitle}>Related Patterns</Heading3>
            <Card padding="medium">
              <View style={styles.relatedList}>
                {grammar.relatedPatterns.map((related, index) => (
                  <View key={index} style={styles.relatedItem}>
                    <Icon name="book" size={16} color={colors.textMuted} />
                    <Text variant="body" color="textSecondary">{related}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* Notes */}
        {grammar.notes && (
          <View style={styles.section}>
            <Heading3 style={styles.sectionTitle}>Notes</Heading3>
            <Card padding="medium" style={styles.notesCard}>
              <View style={styles.notesIcon}>
                <Text>💡</Text>
              </View>
              <Body color="textSecondary">{grammar.notes}</Body>
            </Card>
          </View>
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: layout.screenPaddingHorizontal,
    paddingBottom: spacing['4xl'],
  },
  mainCard: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  pattern: {
    fontSize: 32,
    lineHeight: 40,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  formation: {
    fontSize: 18,
    lineHeight: 28,
  },
  exampleList: {
    gap: spacing.md,
  },
  exampleCard: {
    gap: spacing.sm,
  },
  exampleNumber: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exampleJapanese: {
    fontSize: 18,
    lineHeight: 26,
  },
  exampleReading: {
    marginTop: -spacing.xs,
  },
  exampleEnglish: {
    marginTop: spacing.xs,
  },
  relatedList: {
    gap: spacing.sm,
  },
  relatedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  notesCard: {
    backgroundColor: colors.primaryMuted,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  notesIcon: {
    marginBottom: spacing.sm,
  },
});

export default GrammarDetailScreen;

