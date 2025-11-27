/**
 * Attribution Screen
 * 
 * Displays content sources and licensing information.
 */

import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, Heading2, Heading3, Caption, Body } from '@/components/shared';
import { colors, spacing, layout, borderRadius } from '@/theme';
import type { SettingsScreenProps } from '@/types';

interface ContentSource {
  name: string;
  website: string;
  license: string;
  description: string;
  provides: string[];
}

const CONTENT_SOURCES: ContentSource[] = [
  {
    name: 'Hanabira.org',
    website: 'https://hanabira.org',
    license: 'CC BY-SA 4.0',
    description: 'Japanese language learning resources',
    provides: [
      'JLPT vocabulary lists (N5-N1)',
      'Grammar explanations and patterns',
      'Example sentences',
    ],
  },
  {
    name: 'JMdict Project',
    website: 'https://www.edrdg.org/jmdict/j_jmdict.html',
    license: 'CC BY-SA 4.0',
    description: 'Electronic Dictionary Research and Development Group',
    provides: [
      'Japanese-English dictionary entries',
      'Word readings and meanings',
      'Part of speech information',
    ],
  },
];

export function AttributionScreen({ navigation }: SettingsScreenProps<'DataSources'>) {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => 
      console.error('[Attribution] Failed to open URL:', err)
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text color="primary">← Back</Text>
        </TouchableOpacity>
        <Heading2>Data Sources</Heading2>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Introduction */}
        <Card padding="large" style={styles.introCard}>
          <Text variant="h3" style={styles.introTitle}>📚 Content Attribution</Text>
          <Body color="textSecondary">
            Ganba Hero uses open-source vocabulary and grammar content from the following sources. 
            We're grateful to these projects for making quality Japanese learning resources available.
          </Body>
        </Card>

        {/* Content Sources */}
        {CONTENT_SOURCES.map((source) => (
          <Card key={source.name} padding="large" style={styles.sourceCard}>
            <View style={styles.sourceHeader}>
              <Heading3>{source.name}</Heading3>
              <View style={styles.licenseBadge}>
                <Caption color="primary">{source.license}</Caption>
              </View>
            </View>
            
            <Caption color="textMuted" style={styles.description}>
              {source.description}
            </Caption>

            <TouchableOpacity 
              onPress={() => openLink(source.website)}
              style={styles.linkButton}
            >
              <Text color="primary" variant="body">{source.website}</Text>
            </TouchableOpacity>

            <View style={styles.providesSection}>
              <Caption color="textSecondary" style={styles.providesLabel}>
                Provides:
              </Caption>
              {source.provides.map((item, index) => (
                <View key={index} style={styles.providesItem}>
                  <Text color="textSecondary">•</Text>
                  <Body color="textSecondary">{item}</Body>
                </View>
              ))}
            </View>
          </Card>
        ))}

        {/* License Summary */}
        <Card padding="large" style={styles.licenseCard}>
          <Heading3>License Summary</Heading3>
          <Body color="textSecondary" style={styles.licenseDescription}>
            Both sources use the Creative Commons Attribution-ShareAlike 4.0 license (CC BY-SA 4.0).
          </Body>

          <View style={styles.licenseTerms}>
            <View style={styles.termRow}>
              <Text style={styles.termIcon}>✅</Text>
              <Body>Commercial use is permitted</Body>
            </View>
            <View style={styles.termRow}>
              <Text style={styles.termIcon}>✅</Text>
              <Body>Modifications are permitted</Body>
            </View>
            <View style={styles.termRow}>
              <Text style={styles.termIcon}>✅</Text>
              <Body>Distribution is permitted</Body>
            </View>
            <View style={styles.termDivider} />
            <View style={styles.termRow}>
              <Text style={styles.termIcon}>📝</Text>
              <Body>Attribution required</Body>
            </View>
            <View style={styles.termRow}>
              <Text style={styles.termIcon}>🔄</Text>
              <Body>ShareAlike for content redistribution</Body>
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => openLink('https://creativecommons.org/licenses/by-sa/4.0/')}
            style={styles.readMore}
          >
            <Text color="primary">Read full license →</Text>
          </TouchableOpacity>
        </Card>

        {/* App Code Note */}
        <Card padding="medium" style={styles.noteCard}>
          <Caption color="textMuted" align="center">
            Note: The ShareAlike requirement applies only to the content data. 
            The Ganba Hero application code is proprietary and separate from the content.
          </Caption>
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: layout.screenPaddingHorizontal,
    gap: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  introCard: {
    gap: spacing.md,
  },
  introTitle: {
    marginBottom: spacing.xs,
  },
  sourceCard: {
    gap: spacing.sm,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  licenseBadge: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  description: {
    marginTop: -spacing.xs,
  },
  linkButton: {
    marginVertical: spacing.xs,
  },
  providesSection: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  providesLabel: {
    marginBottom: spacing.xs,
  },
  providesItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingLeft: spacing.sm,
  },
  licenseCard: {
    gap: spacing.md,
  },
  licenseDescription: {
    marginTop: -spacing.xs,
  },
  licenseTerms: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  termIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  termDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  readMore: {
    alignSelf: 'flex-start',
  },
  noteCard: {
    backgroundColor: colors.surfaceHighlight,
    marginTop: spacing.sm,
  },
});

export default AttributionScreen;

