/**
 * Spaced Repetition System (SM-2 Algorithm)
 * 
 * Quality ratings:
 * 0 - Complete blackout, no memory
 * 1 - Incorrect, but recognized answer when shown
 * 2 - Incorrect, but answer was easy to recall when shown
 * 3 - Correct with serious difficulty
 * 4 - Correct with some hesitation
 * 5 - Perfect response, no hesitation
 */

import { addDays, startOfDay, isAfter, isSameDay } from 'date-fns';
import type { VocabProgress, CardStatus } from '@/types';

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export interface SRSUpdate {
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReview: Date;
  status: CardStatus;
}

/**
 * Calculate the next review schedule based on SM-2 algorithm
 */
export function calculateNextReview(
  currentProgress: Pick<VocabProgress, 'interval' | 'easeFactor' | 'repetitions'>,
  quality: Quality
): SRSUpdate {
  let { interval, easeFactor, repetitions } = currentProgress;

  // Quality >= 3 means the answer was correct
  if (quality >= 3) {
    // Calculate new interval
    if (repetitions === 0) {
      interval = 1; // First successful review: 1 day
    } else if (repetitions === 1) {
      interval = 6; // Second successful review: 6 days
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect answer - reset to beginning
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor using SM-2 formula
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = Math.max(
    1.3, // Minimum ease factor
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // Round ease factor to 2 decimal places
  easeFactor = Math.round(easeFactor * 100) / 100;

  // Calculate next review date (at midnight local time)
  const nextReview = startOfDay(addDays(new Date(), interval));

  // Determine card status based on interval
  let status: CardStatus;
  if (interval === 0) {
    status = 'new';
  } else if (interval <= 1) {
    status = 'learning';
  } else if (interval >= 21) {
    status = 'mastered';
  } else {
    status = 'review';
  }

  return {
    interval,
    easeFactor,
    repetitions,
    nextReview,
    status,
  };
}

/**
 * Check if a card is due for review
 * Cards are due at midnight local time
 */
export function isCardDue(nextReview: Date): boolean {
  const today = startOfDay(new Date());
  const reviewDate = startOfDay(nextReview);
  return isAfter(today, reviewDate) || isSameDay(today, reviewDate);
}

/**
 * Calculate days until next review
 * Negative means overdue
 */
export function daysUntilReview(nextReview: Date): number {
  const today = startOfDay(new Date());
  const reviewDate = startOfDay(nextReview);
  const diffTime = reviewDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get the priority of a card for review queue
 * Higher number = higher priority (should be reviewed first)
 */
export function getCardPriority(progress: VocabProgress): number {
  const daysOverdue = -daysUntilReview(progress.nextReview.toDate());
  
  if (daysOverdue > 0) {
    // Overdue cards get highest priority based on how overdue they are
    return 1000 + daysOverdue;
  }
  
  // Learning cards get priority over review cards
  if (progress.status === 'learning') {
    return 500;
  }
  
  // New cards get base priority
  if (progress.status === 'new') {
    return 100;
  }
  
  // Review cards (not overdue) get lowest priority
  return 0;
}

/**
 * Sort cards by priority for review
 */
export function sortByPriority(cards: VocabProgress[]): VocabProgress[] {
  return [...cards].sort((a, b) => getCardPriority(b) - getCardPriority(a));
}

/**
 * Default progress values for new cards
 */
export const DEFAULT_SRS_VALUES = {
  interval: 0,
  easeFactor: 2.5,
  repetitions: 0,
} as const;

