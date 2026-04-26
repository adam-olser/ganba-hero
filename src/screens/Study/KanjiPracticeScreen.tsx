import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card, Text, Heading2, Heading3, Body, Caption, Button } from '@/components/shared';
import { colors, spacing, layout, borderRadius } from '@/theme';
import { useAuthStore } from '@/store';
import { speakJapanese } from '@/services/tts';
import { useScreenAnalytics } from '@/hooks';
import type { StudyScreenProps, JlptLevel } from '@/types';
import firestore from '@react-native-firebase/firestore';

interface KanjiCard {
  id: string;
  character: string;
  onyomi: string[];
  kunyomi: string[];
  meanings: string[];
  jlptLevel: JlptLevel;
  strokeCount: number;
  frequencyRank: number;
  examples: Array<{ word: string; reading: string; meaning: string }>;
}

const JLPT_LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

async function getKanjiByLevel(level: JlptLevel): Promise<KanjiCard[]> {
  const snapshot = await firestore()
    .collection('kanji')
    .where('jlptLevel', '==', level)
    .orderBy('frequencyRank', 'asc')
    .limit(50)
    .get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as KanjiCard));
}

export function KanjiPracticeScreen({ navigation }: StudyScreenProps<'KanjiPractice'>) {
  useScreenAnalytics('KanjiPractice');
  const user = useAuthStore(s => s.user);
  const [selectedLevel, setSelectedLevel] = useState<JlptLevel>(user?.currentLevel ?? 'N5');
  const [flipped, setFlipped] = useState<string | null>(null);

  const { data: kanjiList, isLoading } = useQuery({
    queryKey: ['kanji', selectedLevel],
    queryFn: () => getKanjiByLevel(selectedLevel),
    staleTime: 10 * 60 * 1000,
  });

  const handleFlip = useCallback((id: string) => {
    setFlipped(prev => (prev === id ? null : id));
  }, []);

  const handleSpeak = useCallback((character: string) => {
    speakJapanese(character);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text color="primary">← Back</Text>
        </TouchableOpacity>
        <Heading2>Kanji</Heading2>
        <View style={{ width: 48 }} />
      </View>

      {/* Level Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
        {JLPT_LEVELS.map(level => (
          <Pressable
            key={level}
            style={[styles.tab, selectedLevel === level && styles.tabActive]}
            onPress={() => setSelectedLevel(level)}
          >
            <Text variant="label" color={selectedLevel === level ? 'primary' : 'textMuted'}>{level}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Caption>Loading kanji...</Caption>
        </View>
      ) : !kanjiList || kanjiList.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>漢</Text>
          <Heading3 align="center">No kanji yet</Heading3>
          <Body color="textSecondary" align="center">
            {selectedLevel} kanji data is coming soon.
          </Body>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {kanjiList.map(kanji => {
            const isFlipped = flipped === kanji.id;
            return (
              <Pressable key={kanji.id} style={styles.cardWrapper} onPress={() => handleFlip(kanji.id)}>
                <Card variant="elevated" style={styles.card}>
                  {!isFlipped ? (
                    <View style={styles.front}>
                      <Text style={styles.character}>{kanji.character}</Text>
                      <Caption color="textMuted">Tap to reveal</Caption>
                    </View>
                  ) : (
                    <View style={styles.back}>
                      <Text style={styles.characterSmall}>{kanji.character}</Text>
                      <Pressable onPress={() => handleSpeak(kanji.character)} style={styles.speakBtn}>
                        <Caption color="primary">🔊</Caption>
                      </Pressable>
                      <View style={styles.readings}>
                        {kanji.onyomi.length > 0 && (
                          <Caption color="textMuted">音: {kanji.onyomi.join('・')}</Caption>
                        )}
                        {kanji.kunyomi.length > 0 && (
                          <Caption color="textMuted">訓: {kanji.kunyomi.join('・')}</Caption>
                        )}
                      </View>
                      <Body color="textSecondary" align="center">
                        {kanji.meanings.slice(0, 3).join(', ')}
                      </Body>
                    </View>
                  )}
                </Card>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: layout.screenPaddingHorizontal,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabs: { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabsContent: { paddingHorizontal: layout.screenPaddingHorizontal, gap: spacing.sm, alignItems: 'center' },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  tabActive: { backgroundColor: colors.primaryMuted },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  emptyEmoji: { fontSize: 64, color: colors.textMuted },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: layout.screenPaddingHorizontal,
    gap: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  cardWrapper: { width: '47%' },
  card: { minHeight: 120, alignItems: 'center', justifyContent: 'center', padding: spacing.md, gap: spacing.xs },
  front: { alignItems: 'center', gap: spacing.xs },
  back: { alignItems: 'center', gap: spacing.xs },
  character: { fontSize: 52, lineHeight: 60, color: colors.textPrimary },
  characterSmall: { fontSize: 32, lineHeight: 38, color: colors.textPrimary },
  speakBtn: { paddingVertical: spacing.xs },
  readings: { alignItems: 'center', gap: 2 },
});

export default KanjiPracticeScreen;
