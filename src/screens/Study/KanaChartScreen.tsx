import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading2, Heading3, Caption } from '@/components/shared';
import { colors, spacing, layout, borderRadius } from '@/theme';
import { speakJapanese } from '@/services/tts';
import type { StudyScreenProps } from '@/types';

type KanaType = 'hiragana' | 'katakana';

interface KanaRow {
  consonant: string;
  kana: { char: string; romaji: string }[];
}

const HIRAGANA_BASIC: KanaRow[] = [
  { consonant: '', kana: [{ char: 'あ', romaji: 'a' }, { char: 'い', romaji: 'i' }, { char: 'う', romaji: 'u' }, { char: 'え', romaji: 'e' }, { char: 'お', romaji: 'o' }] },
  { consonant: 'k', kana: [{ char: 'か', romaji: 'ka' }, { char: 'き', romaji: 'ki' }, { char: 'く', romaji: 'ku' }, { char: 'け', romaji: 'ke' }, { char: 'こ', romaji: 'ko' }] },
  { consonant: 's', kana: [{ char: 'さ', romaji: 'sa' }, { char: 'し', romaji: 'shi' }, { char: 'す', romaji: 'su' }, { char: 'せ', romaji: 'se' }, { char: 'そ', romaji: 'so' }] },
  { consonant: 't', kana: [{ char: 'た', romaji: 'ta' }, { char: 'ち', romaji: 'chi' }, { char: 'つ', romaji: 'tsu' }, { char: 'て', romaji: 'te' }, { char: 'と', romaji: 'to' }] },
  { consonant: 'n', kana: [{ char: 'な', romaji: 'na' }, { char: 'に', romaji: 'ni' }, { char: 'ぬ', romaji: 'nu' }, { char: 'ね', romaji: 'ne' }, { char: 'の', romaji: 'no' }] },
  { consonant: 'h', kana: [{ char: 'は', romaji: 'ha' }, { char: 'ひ', romaji: 'hi' }, { char: 'ふ', romaji: 'fu' }, { char: 'へ', romaji: 'he' }, { char: 'ほ', romaji: 'ho' }] },
  { consonant: 'm', kana: [{ char: 'ま', romaji: 'ma' }, { char: 'み', romaji: 'mi' }, { char: 'む', romaji: 'mu' }, { char: 'め', romaji: 'me' }, { char: 'も', romaji: 'mo' }] },
  { consonant: 'y', kana: [{ char: 'や', romaji: 'ya' }, { char: '', romaji: '' }, { char: 'ゆ', romaji: 'yu' }, { char: '', romaji: '' }, { char: 'よ', romaji: 'yo' }] },
  { consonant: 'r', kana: [{ char: 'ら', romaji: 'ra' }, { char: 'り', romaji: 'ri' }, { char: 'る', romaji: 'ru' }, { char: 'れ', romaji: 're' }, { char: 'ろ', romaji: 'ro' }] },
  { consonant: 'w', kana: [{ char: 'わ', romaji: 'wa' }, { char: '', romaji: '' }, { char: '', romaji: '' }, { char: '', romaji: '' }, { char: 'を', romaji: 'wo' }] },
  { consonant: 'ん', kana: [{ char: 'ん', romaji: 'n' }, { char: '', romaji: '' }, { char: '', romaji: '' }, { char: '', romaji: '' }, { char: '', romaji: '' }] },
];

const HIRAGANA_DAKUTEN: KanaRow[] = [
  { consonant: 'g', kana: [{ char: 'が', romaji: 'ga' }, { char: 'ぎ', romaji: 'gi' }, { char: 'ぐ', romaji: 'gu' }, { char: 'げ', romaji: 'ge' }, { char: 'ご', romaji: 'go' }] },
  { consonant: 'z', kana: [{ char: 'ざ', romaji: 'za' }, { char: 'じ', romaji: 'ji' }, { char: 'ず', romaji: 'zu' }, { char: 'ぜ', romaji: 'ze' }, { char: 'ぞ', romaji: 'zo' }] },
  { consonant: 'd', kana: [{ char: 'だ', romaji: 'da' }, { char: 'ぢ', romaji: 'ji' }, { char: 'づ', romaji: 'zu' }, { char: 'で', romaji: 'de' }, { char: 'ど', romaji: 'do' }] },
  { consonant: 'b', kana: [{ char: 'ば', romaji: 'ba' }, { char: 'び', romaji: 'bi' }, { char: 'ぶ', romaji: 'bu' }, { char: 'べ', romaji: 'be' }, { char: 'ぼ', romaji: 'bo' }] },
  { consonant: 'p', kana: [{ char: 'ぱ', romaji: 'pa' }, { char: 'ぴ', romaji: 'pi' }, { char: 'ぷ', romaji: 'pu' }, { char: 'ぺ', romaji: 'pe' }, { char: 'ぽ', romaji: 'po' }] },
];

// Combo kana: 3 columns (ya / yu / yo)
interface ComboRow {
  base: string;
  combos: { char: string; romaji: string }[];
}

const HIRAGANA_COMBOS: ComboRow[] = [
  { base: 'き', combos: [{ char: 'きゃ', romaji: 'kya' }, { char: 'きゅ', romaji: 'kyu' }, { char: 'きょ', romaji: 'kyo' }] },
  { base: 'し', combos: [{ char: 'しゃ', romaji: 'sha' }, { char: 'しゅ', romaji: 'shu' }, { char: 'しょ', romaji: 'sho' }] },
  { base: 'ち', combos: [{ char: 'ちゃ', romaji: 'cha' }, { char: 'ちゅ', romaji: 'chu' }, { char: 'ちょ', romaji: 'cho' }] },
  { base: 'に', combos: [{ char: 'にゃ', romaji: 'nya' }, { char: 'にゅ', romaji: 'nyu' }, { char: 'にょ', romaji: 'nyo' }] },
  { base: 'ひ', combos: [{ char: 'ひゃ', romaji: 'hya' }, { char: 'ひゅ', romaji: 'hyu' }, { char: 'ひょ', romaji: 'hyo' }] },
  { base: 'み', combos: [{ char: 'みゃ', romaji: 'mya' }, { char: 'みゅ', romaji: 'myu' }, { char: 'みょ', romaji: 'myo' }] },
  { base: 'り', combos: [{ char: 'りゃ', romaji: 'rya' }, { char: 'りゅ', romaji: 'ryu' }, { char: 'りょ', romaji: 'ryo' }] },
  { base: 'ぎ', combos: [{ char: 'ぎゃ', romaji: 'gya' }, { char: 'ぎゅ', romaji: 'gyu' }, { char: 'ぎょ', romaji: 'gyo' }] },
  { base: 'じ', combos: [{ char: 'じゃ', romaji: 'ja' }, { char: 'じゅ', romaji: 'ju' }, { char: 'じょ', romaji: 'jo' }] },
  { base: 'び', combos: [{ char: 'びゃ', romaji: 'bya' }, { char: 'びゅ', romaji: 'byu' }, { char: 'びょ', romaji: 'byo' }] },
  { base: 'ぴ', combos: [{ char: 'ぴゃ', romaji: 'pya' }, { char: 'ぴゅ', romaji: 'pyu' }, { char: 'ぴょ', romaji: 'pyo' }] },
];

const KATAKANA_BASIC: KanaRow[] = [
  { consonant: '', kana: [{ char: 'ア', romaji: 'a' }, { char: 'イ', romaji: 'i' }, { char: 'ウ', romaji: 'u' }, { char: 'エ', romaji: 'e' }, { char: 'オ', romaji: 'o' }] },
  { consonant: 'k', kana: [{ char: 'カ', romaji: 'ka' }, { char: 'キ', romaji: 'ki' }, { char: 'ク', romaji: 'ku' }, { char: 'ケ', romaji: 'ke' }, { char: 'コ', romaji: 'ko' }] },
  { consonant: 's', kana: [{ char: 'サ', romaji: 'sa' }, { char: 'シ', romaji: 'shi' }, { char: 'ス', romaji: 'su' }, { char: 'セ', romaji: 'se' }, { char: 'ソ', romaji: 'so' }] },
  { consonant: 't', kana: [{ char: 'タ', romaji: 'ta' }, { char: 'チ', romaji: 'chi' }, { char: 'ツ', romaji: 'tsu' }, { char: 'テ', romaji: 'te' }, { char: 'ト', romaji: 'to' }] },
  { consonant: 'n', kana: [{ char: 'ナ', romaji: 'na' }, { char: 'ニ', romaji: 'ni' }, { char: 'ヌ', romaji: 'nu' }, { char: 'ネ', romaji: 'ne' }, { char: 'ノ', romaji: 'no' }] },
  { consonant: 'h', kana: [{ char: 'ハ', romaji: 'ha' }, { char: 'ヒ', romaji: 'hi' }, { char: 'フ', romaji: 'fu' }, { char: 'ヘ', romaji: 'he' }, { char: 'ホ', romaji: 'ho' }] },
  { consonant: 'm', kana: [{ char: 'マ', romaji: 'ma' }, { char: 'ミ', romaji: 'mi' }, { char: 'ム', romaji: 'mu' }, { char: 'メ', romaji: 'me' }, { char: 'モ', romaji: 'mo' }] },
  { consonant: 'y', kana: [{ char: 'ヤ', romaji: 'ya' }, { char: '', romaji: '' }, { char: 'ユ', romaji: 'yu' }, { char: '', romaji: '' }, { char: 'ヨ', romaji: 'yo' }] },
  { consonant: 'r', kana: [{ char: 'ラ', romaji: 'ra' }, { char: 'リ', romaji: 'ri' }, { char: 'ル', romaji: 'ru' }, { char: 'レ', romaji: 're' }, { char: 'ロ', romaji: 'ro' }] },
  { consonant: 'w', kana: [{ char: 'ワ', romaji: 'wa' }, { char: '', romaji: '' }, { char: '', romaji: '' }, { char: '', romaji: '' }, { char: 'ヲ', romaji: 'wo' }] },
  { consonant: 'ン', kana: [{ char: 'ン', romaji: 'n' }, { char: '', romaji: '' }, { char: '', romaji: '' }, { char: '', romaji: '' }, { char: '', romaji: '' }] },
];

const KATAKANA_DAKUTEN: KanaRow[] = [
  { consonant: 'g', kana: [{ char: 'ガ', romaji: 'ga' }, { char: 'ギ', romaji: 'gi' }, { char: 'グ', romaji: 'gu' }, { char: 'ゲ', romaji: 'ge' }, { char: 'ゴ', romaji: 'go' }] },
  { consonant: 'z', kana: [{ char: 'ザ', romaji: 'za' }, { char: 'ジ', romaji: 'ji' }, { char: 'ズ', romaji: 'zu' }, { char: 'ゼ', romaji: 'ze' }, { char: 'ゾ', romaji: 'zo' }] },
  { consonant: 'd', kana: [{ char: 'ダ', romaji: 'da' }, { char: 'ヂ', romaji: 'ji' }, { char: 'ヅ', romaji: 'zu' }, { char: 'デ', romaji: 'de' }, { char: 'ド', romaji: 'do' }] },
  { consonant: 'b', kana: [{ char: 'バ', romaji: 'ba' }, { char: 'ビ', romaji: 'bi' }, { char: 'ブ', romaji: 'bu' }, { char: 'ベ', romaji: 'be' }, { char: 'ボ', romaji: 'bo' }] },
  { consonant: 'p', kana: [{ char: 'パ', romaji: 'pa' }, { char: 'ピ', romaji: 'pi' }, { char: 'プ', romaji: 'pu' }, { char: 'ペ', romaji: 'pe' }, { char: 'ポ', romaji: 'po' }] },
];

const KATAKANA_COMBOS: ComboRow[] = [
  { base: 'キ', combos: [{ char: 'キャ', romaji: 'kya' }, { char: 'キュ', romaji: 'kyu' }, { char: 'キョ', romaji: 'kyo' }] },
  { base: 'シ', combos: [{ char: 'シャ', romaji: 'sha' }, { char: 'シュ', romaji: 'shu' }, { char: 'ショ', romaji: 'sho' }] },
  { base: 'チ', combos: [{ char: 'チャ', romaji: 'cha' }, { char: 'チュ', romaji: 'chu' }, { char: 'チョ', romaji: 'cho' }] },
  { base: 'ニ', combos: [{ char: 'ニャ', romaji: 'nya' }, { char: 'ニュ', romaji: 'nyu' }, { char: 'ニョ', romaji: 'nyo' }] },
  { base: 'ヒ', combos: [{ char: 'ヒャ', romaji: 'hya' }, { char: 'ヒュ', romaji: 'hyu' }, { char: 'ヒョ', romaji: 'hyo' }] },
  { base: 'ミ', combos: [{ char: 'ミャ', romaji: 'mya' }, { char: 'ミュ', romaji: 'myu' }, { char: 'ミョ', romaji: 'myo' }] },
  { base: 'リ', combos: [{ char: 'リャ', romaji: 'rya' }, { char: 'リュ', romaji: 'ryu' }, { char: 'リョ', romaji: 'ryo' }] },
  { base: 'ギ', combos: [{ char: 'ギャ', romaji: 'gya' }, { char: 'ギュ', romaji: 'gyu' }, { char: 'ギョ', romaji: 'gyo' }] },
  { base: 'ジ', combos: [{ char: 'ジャ', romaji: 'ja' }, { char: 'ジュ', romaji: 'ju' }, { char: 'ジョ', romaji: 'jo' }] },
  { base: 'ビ', combos: [{ char: 'ビャ', romaji: 'bya' }, { char: 'ビュ', romaji: 'byu' }, { char: 'ビョ', romaji: 'byo' }] },
  { base: 'ピ', combos: [{ char: 'ピャ', romaji: 'pya' }, { char: 'ピュ', romaji: 'pyu' }, { char: 'ピョ', romaji: 'pyo' }] },
];

const VOWELS = ['a', 'i', 'u', 'e', 'o'];

export function KanaChartScreen({ navigation }: StudyScreenProps<'KanaChart'>) {
  const [activeType, setActiveType] = useState<KanaType>('hiragana');
  const [showRomaji, setShowRomaji] = useState(true);

  const basicRows = activeType === 'hiragana' ? HIRAGANA_BASIC : KATAKANA_BASIC;
  const dakutenRows = activeType === 'hiragana' ? HIRAGANA_DAKUTEN : KATAKANA_DAKUTEN;
  const comboRows = activeType === 'hiragana' ? HIRAGANA_COMBOS : KATAKANA_COMBOS;

  const renderKanaRow = (row: KanaRow, rowIndex: number) => (
    <View key={rowIndex} style={styles.kanaRow}>
      <View style={styles.consonantCell}>
        <Caption color="textMuted">{row.consonant}</Caption>
      </View>
      {row.kana.map((item, colIndex) => (
        <Pressable
          key={`${rowIndex}-${colIndex}`}
          style={[styles.kanaCell, !item.char && styles.emptyCell]}
          onPress={() => item.char && speakJapanese(item.char)}
          disabled={!item.char}
        >
          {item.char ? (
            <>
              <Text variant="japaneseLarge" style={styles.kanaChar}>{item.char}</Text>
              {showRomaji && <Caption color="textMuted">{item.romaji}</Caption>}
            </>
          ) : null}
        </Pressable>
      ))}
    </View>
  );

  const renderComboRow = (row: ComboRow, rowIndex: number) => (
    <View key={rowIndex} style={styles.comboRow}>
      <View style={styles.comboBaseCell}>
        <Text variant="japaneseLarge" style={styles.comboBaseChar}>{row.base}</Text>
      </View>
      {row.combos.map((item, colIndex) => (
        <Pressable
          key={`combo-${rowIndex}-${colIndex}`}
          style={styles.comboCell}
          onPress={() => speakJapanese(item.char)}
        >
          <Text variant="japaneseLarge" style={styles.comboChar}>{item.char}</Text>
          {showRomaji && <Caption color="textMuted">{item.romaji}</Caption>}
        </Pressable>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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

        <View style={styles.toggleContainer}>
          <Pressable
            style={[styles.toggleButton, activeType === 'hiragana' && styles.toggleActive]}
            onPress={() => setActiveType('hiragana')}
          >
            <Text variant="body" color={activeType === 'hiragana' ? 'textPrimary' : 'textMuted'}
              style={activeType === 'hiragana' ? styles.toggleTextActive : undefined}>
              ひらがな
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleButton, activeType === 'katakana' && styles.toggleActive]}
            onPress={() => setActiveType('katakana')}
          >
            <Text variant="body" color={activeType === 'katakana' ? 'textPrimary' : 'textMuted'}
              style={activeType === 'katakana' ? styles.toggleTextActive : undefined}>
              カタカナ
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic */}
        <Heading3 style={styles.sectionTitle}>Basic</Heading3>
        <View style={styles.vowelRow}>
          <View style={styles.consonantCell} />
          {VOWELS.map(v => (
            <View key={v} style={styles.vowelCell}>
              <Caption color="primary">{v}</Caption>
            </View>
          ))}
        </View>
        {basicRows.map(renderKanaRow)}

        {/* Dakuten / Handakuten */}
        <Heading3 style={[styles.sectionTitle, styles.sectionGap]}>Dakuten ゛/ Handakuten ゜</Heading3>
        <View style={styles.vowelRow}>
          <View style={styles.consonantCell} />
          {VOWELS.map(v => (
            <View key={v} style={styles.vowelCell}>
              <Caption color="primary">{v}</Caption>
            </View>
          ))}
        </View>
        {dakutenRows.map(renderKanaRow)}

        {/* Combo kana */}
        <Heading3 style={[styles.sectionTitle, styles.sectionGap]}>Combinations</Heading3>
        <View style={styles.comboHeaderRow}>
          <View style={styles.comboBaseCell} />
          {['ya', 'yu', 'yo'].map(v => (
            <View key={v} style={styles.comboCell}>
              <Caption color="primary">{v}</Caption>
            </View>
          ))}
        </View>
        {comboRows.map(renderComboRow)}

        <View style={styles.footer}>
          <Caption color="textMuted" style={styles.footerText}>
            Tap any character to hear its pronunciation
          </Caption>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  toggleActive: { backgroundColor: colors.primaryMuted },
  toggleTextActive: { fontWeight: '600' },
  scrollView: { flex: 1 },
  content: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  sectionTitle: { marginBottom: spacing.sm },
  sectionGap: { marginTop: spacing.xl },
  vowelRow: { flexDirection: 'row', marginBottom: spacing.sm },
  vowelCell: { flex: 1, alignItems: 'center', paddingVertical: spacing.xs },
  consonantCell: { width: 24, alignItems: 'center', justifyContent: 'center' },
  kanaRow: { flexDirection: 'row', marginBottom: spacing.xs },
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
  emptyCell: { backgroundColor: 'transparent' },
  kanaChar: { fontSize: 26, lineHeight: 30 },
  // Combo rows
  comboHeaderRow: { flexDirection: 'row', marginBottom: spacing.sm },
  comboRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    alignItems: 'center',
  },
  comboBaseCell: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comboBaseChar: { fontSize: 20, lineHeight: 24, color: colors.textMuted },
  comboCell: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  comboChar: { fontSize: 22, lineHeight: 26 },
  footer: { marginTop: spacing.xl, alignItems: 'center' },
  footerText: { textAlign: 'center' },
});

export default KanaChartScreen;
