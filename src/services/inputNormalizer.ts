/**
 * Input Normalizer Service
 * 
 * Handles conversion between romaji and hiragana,
 * and normalizes user input for answer checking.
 */

import { toHiragana, toKatakana, isRomaji, isHiragana, isKatakana, isJapanese } from 'wanakana';

/**
 * Normalize user input for comparison
 * - Converts romaji to hiragana
 * - Lowercases English
 * - Trims whitespace
 */
export function normalizeInput(input: string): string {
  const trimmed = input.trim();
  
  // If it's romaji, convert to hiragana
  if (isRomaji(trimmed)) {
    return toHiragana(trimmed.toLowerCase());
  }
  
  // If it's already Japanese, return as-is (just trimmed)
  if (isJapanese(trimmed)) {
    return trimmed;
  }
  
  // Otherwise (English), lowercase it
  return trimmed.toLowerCase();
}

/**
 * Normalize Japanese text for comparison
 * - Converts katakana to hiragana for consistent comparison
 */
export function normalizeJapanese(text: string): string {
  return text
    .split('')
    .map(char => (isKatakana(char) ? toHiragana(char) : char))
    .join('');
}

/**
 * Check if two strings match (with normalization)
 */
export function stringsMatch(input: string, target: string): boolean {
  const normalizedInput = normalizeInput(input);
  const normalizedTarget = normalizeInput(target);
  return normalizedInput === normalizedTarget;
}

/**
 * Check if user answer matches correct answer or any synonym
 */
export function isAnswerCorrect(
  userAnswer: string,
  correctAnswer: string,
  synonyms: string[] = []
): { correct: boolean; matchedAnswer: string | null } {
  const normalizedUser = normalizeInput(userAnswer);
  
  // Check against correct answer
  if (normalizedUser === normalizeInput(correctAnswer)) {
    return { correct: true, matchedAnswer: correctAnswer };
  }
  
  // Check against synonyms
  for (const synonym of synonyms) {
    if (normalizedUser === normalizeInput(synonym)) {
      return { correct: true, matchedAnswer: synonym };
    }
  }
  
  return { correct: false, matchedAnswer: null };
}

/**
 * Check if Japanese reading matches (handles both romaji and kana input)
 */
export function isReadingCorrect(
  userAnswer: string,
  correctReading: string,
  readingSynonyms: string[] = []
): { correct: boolean; matchedReading: string | null } {
  // Normalize user input to hiragana
  let normalizedUser = normalizeInput(userAnswer);
  if (isRomaji(userAnswer.trim())) {
    normalizedUser = toHiragana(userAnswer.trim().toLowerCase());
  }
  
  // Normalize correct reading to hiragana
  const normalizedCorrect = normalizeJapanese(correctReading);
  
  if (normalizedUser === normalizedCorrect) {
    return { correct: true, matchedReading: correctReading };
  }
  
  // Check synonyms
  for (const synonym of readingSynonyms) {
    if (normalizedUser === normalizeJapanese(synonym)) {
      return { correct: true, matchedReading: synonym };
    }
  }
  
  return { correct: false, matchedReading: null };
}

/**
 * Calculate similarity between two strings (0-1)
 * Uses Levenshtein distance
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeInput(str1);
  const s2 = normalizeInput(str2);
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  
  return 1 - distance / maxLength;
}

/**
 * Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  // Create matrix
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  
  // Initialize first row and column
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  // Fill in the rest
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return dp[m][n];
}

/**
 * Determine if answer is "almost correct" (close but not exact)
 */
export function isAlmostCorrect(
  userAnswer: string,
  correctAnswer: string,
  threshold: number = 0.8
): boolean {
  return calculateSimilarity(userAnswer, correctAnswer) >= threshold;
}

/**
 * Get input type for display purposes
 */
export function getInputType(input: string): 'romaji' | 'hiragana' | 'katakana' | 'kanji' | 'english' | 'mixed' {
  const trimmed = input.trim();
  
  if (isRomaji(trimmed)) return 'romaji';
  if (isHiragana(trimmed)) return 'hiragana';
  if (isKatakana(trimmed)) return 'katakana';
  if (isJapanese(trimmed)) return 'kanji';
  if (/^[a-zA-Z\s]+$/.test(trimmed)) return 'english';
  return 'mixed';
}

