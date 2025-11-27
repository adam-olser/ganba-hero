/**
 * XP and Level Calculator
 * 
 * Anki-style XP system where longer intervals earn more XP,
 * rewarding well-learned cards.
 */

import type { Quality } from './srs';

// XP constants
export const XP_PER_LEVEL = 500;
export const MAX_LEVEL = 100;

/**
 * Calculate XP earned for a single review
 * Based on the card's interval (Anki-style)
 */
export function calculateXpEarned(interval: number, correct: boolean): number {
  if (!correct) {
    // Small XP for effort even when incorrect
    return 2;
  }

  // XP scales with interval - well-learned cards earn more
  if (interval <= 1) return 5;      // New/learning cards
  if (interval <= 7) return 10;     // Young cards
  if (interval <= 30) return 20;    // Maturing cards
  if (interval <= 90) return 25;    // Mature cards
  return 30;                         // Well-established cards
}

/**
 * Calculate XP with quality bonus
 * Perfect answers get a small bonus
 */
export function calculateXpWithQuality(
  interval: number,
  correct: boolean,
  quality: Quality
): number {
  const baseXp = calculateXpEarned(interval, correct);
  
  if (!correct) return baseXp;
  
  // Quality bonus for perfect responses (quality 5)
  if (quality === 5) {
    return Math.round(baseXp * 1.2); // 20% bonus
  }
  
  // Small bonus for quality 4
  if (quality === 4) {
    return Math.round(baseXp * 1.1); // 10% bonus
  }
  
  return baseXp;
}

/**
 * Calculate user level from total XP
 * Linear progression: 500 XP per level
 */
export function calculateLevel(totalXp: number): number {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  return Math.min(level, MAX_LEVEL);
}

/**
 * Get XP progress within current level
 */
export function getLevelProgress(totalXp: number): {
  level: number;
  currentXp: number;
  xpForNextLevel: number;
  progress: number; // 0-1
} {
  const level = calculateLevel(totalXp);
  const xpAtLevelStart = (level - 1) * XP_PER_LEVEL;
  const currentXp = totalXp - xpAtLevelStart;
  const xpForNextLevel = XP_PER_LEVEL;
  const progress = Math.min(currentXp / xpForNextLevel, 1);

  return {
    level,
    currentXp,
    xpForNextLevel,
    progress,
  };
}

/**
 * Calculate XP needed to reach a specific level
 */
export function xpForLevel(level: number): number {
  return (level - 1) * XP_PER_LEVEL;
}

/**
 * Get level title/badge
 */
export function getLevelTitle(level: number): string {
  if (level <= 5) return '初心者'; // Beginner
  if (level <= 10) return '学習者'; // Learner
  if (level <= 20) return '中級者'; // Intermediate
  if (level <= 35) return '上級者'; // Advanced
  if (level <= 50) return '達人'; // Expert
  if (level <= 75) return '名人'; // Master
  return '伝説'; // Legend
}

/**
 * Calculate streak bonus XP
 */
export function calculateStreakBonus(streak: number): number {
  if (streak <= 0) return 0;
  if (streak < 7) return 0;          // No bonus first week
  if (streak < 30) return 5;         // Small bonus
  if (streak < 100) return 10;       // Medium bonus
  if (streak < 365) return 20;       // Large bonus
  return 30;                          // Maximum bonus
}

/**
 * Calculate total XP for a study session
 */
export function calculateSessionXp(
  results: Array<{ interval: number; correct: boolean; quality: Quality }>,
  streak: number = 0
): {
  baseXp: number;
  streakBonus: number;
  totalXp: number;
} {
  const baseXp = results.reduce(
    (sum, result) => sum + calculateXpWithQuality(result.interval, result.correct, result.quality),
    0
  );
  
  const streakBonus = calculateStreakBonus(streak);
  
  return {
    baseXp,
    streakBonus,
    totalXp: baseXp + streakBonus,
  };
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Calculate XP for a session summary
 * Simple interface for UI components
 */
export function calculateXP(params: {
  cardsReviewed: number;
  correctAnswers: number;
  newCardsLearned: number;
  perfectSession: boolean;
  streakBonus: boolean;
}): number {
  const { cardsReviewed, correctAnswers, newCardsLearned, perfectSession, streakBonus } = params;
  
  // Base XP: 10 per correct answer, 2 per incorrect
  const incorrectAnswers = cardsReviewed - correctAnswers;
  let xp = (correctAnswers * 10) + (incorrectAnswers * 2);
  
  // Bonus for new cards learned
  xp += newCardsLearned * 5;
  
  // Perfect session bonus
  if (perfectSession && cardsReviewed >= 5) {
    xp = Math.round(xp * 1.25);
  }
  
  // Streak bonus (if applicable)
  if (streakBonus) {
    xp += 10;
  }
  
  return xp;
}

