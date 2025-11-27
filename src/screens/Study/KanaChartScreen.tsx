/**
 * Kana Chart Screen
 * 
 * Reference chart for Hiragana and Katakana.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading2, Caption } from '@/components/shared';
import { colors, spacing, layout, borderRadius } from '@/theme';
import type { StudyScreenProps } from '@/types';

type KanaType = 'hiragana' | 'katakana';

interface KanaRow {
  consonant: string;
  kana: { char: string; romaji: string }[];
}

const HIRAGANA_CHART: KanaRow[] = [
  {
    consonant: '',
    kana: [
      { char: 'あ', romaji: 'a' },
      { char: 'い', romaji: 'i' },
      { char: 'う', romaji: 'u' },
      { char: 'え', romaji: 'e' },
      { char: 'お', romaji: 'o' },
    ],
  },
  {
    consonant: 'k',
    kana: [
      { char: 'か', romaji: 'ka' },
      { char: 'き', romaji: 'ki' },
      { char: 'く', romaji: 'ku' },
      { char: 'け', romaji: 'ke' },
      { char: 'こ', romaji: 'ko' },
    ],
  },
  {
    consonant: 's',
    kana: [
      { char: 'さ', romaji: 'sa' },
      { char: 'し', romaji: 'shi' },
      { char: 'す', romaji: 'su' },
      { char: 'せ', romaji: 'se' },
      { char: 'そ', romaji: 'so' },
    ],
  },
  {
    consonant: 't',
    kana: [
      { char: 'た', romaji: 'ta' },
      { char: 'ち', romaji: 'chi' },
      { char: 'つ', romaji: 'tsu' },
      { char: 'て', romaji: 'te' },
      { char: 'と', romaji: 'to' },
    ],
  },
  {
    consonant: 'n',
    kana: [
      { char: 'な', romaji: 'na' },
      { char: 'に', romaji: 'ni' },
      { char: 'ぬ', romaji: 'nu' },
      { char: 'ね', romaji: 'ne' },
      { char: 'の', romaji: 'no' },
    ],
  },
  {
    consonant: 'h',
    kana: [
      { char: 'は', romaji: 'ha' },
      { char: 'ひ', romaji: 'hi' },
      { char: 'ふ', romaji: 'fu' },
      { char: 'へ', romaji: 'he' },
      { char: 'ほ', romaji: 'ho' },
    ],
  },
  {
    consonant: 'm',
    kana: [
      { char: 'ま', romaji: 'ma' },
      { char: 'み', romaji: 'mi' },
      { char: 'む', romaji: 'mu' },
      { char: 'め', romaji: 'me' },
      { char: 'も', romaji: 'mo' },
    ],
  },
  {
    consonant: 'y',
    kana: [
      { char: 'や', romaji: 'ya' },
      { char: '', romaji: '' },
      { char: 'ゆ', romaji: 'yu' },
      { char: '', romaji: '' },
      { char: 'よ', romaji: 'yo' },
    ],
  },
  {
    consonant: 'r',
    kana: [
      { char: 'ら', romaji: 'ra' },
      { char: 'り', romaji: 'ri' },
      { char: 'る', romaji: 'ru' },
      { char: 'れ', romaji: 're' },
      { char: 'ろ', romaji: 'ro' },
    ],
  },
  {
    consonant: 'w',
    kana: [
      { char: 'わ', romaji: 'wa' },
      { char: '', romaji: '' },
      { char: '', romaji: '' },
      { char: '', romaji: '' },
      { char: 'を', romaji: 'wo' },
    ],
  },
  {
    consonant: 'ん',
    kana: [
      { char: 'ん', romaji: 'n' },
      { char: '', romaji: '' },
      { char: '', romaji: '' },
      { char: '', romaji: '' },
      { char: '', romaji: '' },
    ],
  },
];

const KATAKANA_CHART: KanaRow[] = [
  {
    consonant: '',
    kana: [
      { char: 'ア', romaji: 'a' },
      { char: 'イ', romaji: 'i' },
      { char: 'ウ', romaji: 'u' },
      { char: 'エ', romaji: 'e' },
      { char: 'オ', romaji: 'o' },
    ],
  },
  {
    consonant: 'k',
    kana: [
      { char: 'カ', romaji: 'ka' },
      { char: 'キ', romaji: 'ki' },
      { char: 'ク', romaji: 'ku' },
      { char: 'ケ', romaji: 'ke' },
      { char: 'コ', romaji: 'ko' },
    ],
  },
  {
    consonant: 's',
    kana: [
      { char: 'サ', romaji: 'sa' },
      { char: 'シ', romaji: 'shi' },
      { char: 'ス', romaji: 'su' },
      { char: 'セ', romaji: 'se' },
      { char: 'ソ', romaji: 'so' },
    ],
  },
  {
    consonant: 't',
    kana: [
      { char: 'タ', romaji: 'ta' },
      { char: 'チ', romaji: 'chi' },
      { char: 'ツ', romaji: 'tsu' },
      { char: 'テ', romaji: 'te' },
      { char: 'ト', romaji: 'to' },
    ],
  },
  {
    consonant: 'n',
    kana: [
      { char: 'ナ', romaji: 'na' },
      { char: 'ニ', romaji: 'ni' },
      { char: 'ヌ', romaji: 'nu' },
      { char: 'ネ', romaji: 'ne' },
      { char: 'ノ', romaji: 'no' },
    ],
  },
  {
    consonant: 'h',
    kana: [
      { char: 'ハ', romaji: 'ha' },
      { char: 'ヒ', romaji: 'hi' },
      { char: 'フ', romaji: 'fu' },
      { char: 'ヘ', romaji: 'he' },
      { char: 'ホ', romaji: 'ho' },
    ],
  },
  {
    consonant: 'm',
    kana: [
      { char: 'マ', romaji: 'ma' },
      { char: 'ミ', romaji: 'mi' },
      { char: 'ム', romaji: 'mu' },
      { char: 'メ', romaji: 'me' },
      { char: 'モ', romaji: 'mo' },
    ],
  },
  {
    consonant: 'y',
    kana: [
      { char: 'ヤ', romaji: 'ya' },
      { char: '', romaji: '' },
      { char: 'ユ', romaji: 'yu' },
      { char: '', romaji: '' },
      { char: 'ヨ', romaji: 'yo' },
    ],
  },
  {
    consonant: 'r',
    kana: [
      { char: 'ラ', romaji: 'ra' },
      { char: 'リ', romaji: 'ri' },
      { char: 'ル', romaji: 'ru' },
      { char: 'レ', romaji: 're' },
      { char: 'ロ', romaji: 'ro' },
    ],
  },
  {
    consonant: 'w',
    kana: [
      { char: 'ワ', romaji: 'wa' },
      { char: '', romaji: '' },
      { char: '', romaji: '' },
      { char: '', romaji: '' },
      { char: 'ヲ', romaji: 'wo' },
    ],
  },
  {
    consonant: 'ン',
    kana: [
      { char: 'ン', romaji: 'n' },
      { char: '', romaji: '' },
      { char: '', romaji: '' },
      { char: '', romaji: '' },
      { char: '', romaji: '' },
    ],
  },
];

const VOWELS = ['a', 'i', 'u', 'e', 'o'];

export function KanaChartScreen({ navigation }: StudyScreenProps<'KanaChart'>) {
  const [activeType, setActiveType] = useState<KanaType>('hiragana');
  const [showRomaji, setShowRomaji] = useState(true);
  
  const chart = activeType === 'hiragana' ? HIRAGANA_CHART : KATAKANA_CHART;
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text color="primary">← Back</Text>
          </TouchableOpacity>
          <Heading2>Kana Chart</Heading2>
          <TouchableOpacity onPress={() => setShowRomaji(!showRomaji)}>
            <Caption color={showRomaji ? 'primary' : 'textMuted'}>
              {showRomaji ? 'Hide' : 'Show'} Romaji
            </Caption>
          </TouchableOpacity>
        </View>
        
        {/* Type Toggle */}
        <View style={styles.toggleContainer}>
          <Pressable
            style={[styles.toggleButton, activeType === 'hiragana' && styles.toggleActive]}
            onPress={() => setActiveType('hiragana')}
          >
            <Text
              variant="body"
              color={activeType === 'hiragana' ? 'textPrimary' : 'textMuted'}
              style={activeType === 'hiragana' && styles.toggleTextActive}
            >
              ひらがな
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleButton, activeType === 'katakana' && styles.toggleActive]}
            onPress={() => setActiveType('katakana')}
          >
            <Text
              variant="body"
              color={activeType === 'katakana' ? 'textPrimary' : 'textMuted'}
              style={activeType === 'katakana' && styles.toggleTextActive}
            >
              カタカナ
            </Text>
          </Pressable>
        </View>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Vowel Header */}
        <View style={styles.vowelRow}>
          <View style={styles.consonantCell} />
          {VOWELS.map((vowel) => (
            <View key={vowel} style={styles.vowelCell}>
              <Caption color="primary">{vowel}</Caption>
            </View>
          ))}
        </View>
        
        {/* Kana Grid */}
        {chart.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.kanaRow}>
            <View style={styles.consonantCell}>
              <Caption color="textMuted">{row.consonant}</Caption>
            </View>
            {row.kana.map((item, colIndex) => (
              <View
                key={`${rowIndex}-${colIndex}`}
                style={[styles.kanaCell, !item.char && styles.emptyCell]}
              >
                {item.char ? (
                  <>
                    <Text variant="japaneseLarge" style={styles.kanaChar}>
                      {item.char}
                    </Text>
                    {showRomaji && (
                      <Caption color="textMuted">{item.romaji}</Caption>
                    )}
                  </>
                ) : null}
              </View>
            ))}
          </View>
        ))}
        
        {/* Footer info */}
        <View style={styles.footer}>
          <Caption color="textMuted" style={styles.footerText}>
            Tap on any character to hear pronunciation (coming soon)
          </Caption>
        </View>
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
    padding: layout.screenPaddingHorizontal,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: colors.primaryMuted,
  },
  toggleTextActive: {
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  vowelRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  vowelCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  consonantCell: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kanaRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  kanaCell: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  kanaChar: {
    fontSize: 28,
    lineHeight: 32,
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
});

export default KanaChartScreen;

