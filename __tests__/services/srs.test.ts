/**
 * SRS (Spaced Repetition System) Tests
 * 
 * Tests for the SM-2 algorithm implementation.
 */

import {
  calculateNextReview,
  isCardDue,
  daysUntilReview,
  getCardPriority,
  sortByPriority,
  DEFAULT_SRS_VALUES,
  type Quality,
} from '../../src/services/srs';
import { addDays, startOfDay } from 'date-fns';
import type { VocabProgress } from '../../src/types';

describe('calculateNextReview', () => {
  const baseProgress = {
    interval: DEFAULT_SRS_VALUES.interval,
    easeFactor: DEFAULT_SRS_VALUES.easeFactor,
    repetitions: DEFAULT_SRS_VALUES.repetitions,
  };

  describe('first review (repetitions = 0)', () => {
    it('should set interval to 1 day on correct answer (quality >= 3)', () => {
      const result = calculateNextReview(baseProgress, 3);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    it('should keep interval at 1 day on incorrect answer', () => {
      const result = calculateNextReview(baseProgress, 2);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
    });
  });

  describe('second review (repetitions = 1)', () => {
    const secondReviewProgress = {
      interval: 1,
      easeFactor: 2.5,
      repetitions: 1,
    };

    it('should set interval to 6 days on correct answer', () => {
      const result = calculateNextReview(secondReviewProgress, 4);
      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
    });

    it('should reset to interval 1 on incorrect answer', () => {
      const result = calculateNextReview(secondReviewProgress, 1);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
    });
  });

  describe('subsequent reviews (repetitions >= 2)', () => {
    const laterProgress = {
      interval: 6,
      easeFactor: 2.5,
      repetitions: 2,
    };

    it('should multiply interval by ease factor on correct answer', () => {
      const result = calculateNextReview(laterProgress, 4);
      // 6 * 2.5 = 15
      expect(result.interval).toBe(15);
      expect(result.repetitions).toBe(3);
    });
  });

  describe('ease factor adjustments', () => {
    it('should increase ease factor for quality 5', () => {
      const result = calculateNextReview(baseProgress, 5);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    it('should decrease ease factor for quality 3', () => {
      const result = calculateNextReview(baseProgress, 3);
      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it('should never go below minimum ease factor of 1.3', () => {
      const lowEaseProgress = { ...baseProgress, easeFactor: 1.3 };
      const result = calculateNextReview(lowEaseProgress, 0);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('card status', () => {
    it('should set status to "learning" for interval <= 1', () => {
      const result = calculateNextReview(baseProgress, 3);
      expect(result.status).toBe('learning');
    });

    it('should set status to "review" for interval between 2 and 20', () => {
      const progress = { interval: 6, easeFactor: 2.5, repetitions: 2 };
      const result = calculateNextReview(progress, 4);
      expect(result.status).toBe('review');
    });

    it('should set status to "mastered" for interval >= 21', () => {
      const progress = { interval: 15, easeFactor: 2.5, repetitions: 3 };
      const result = calculateNextReview(progress, 5);
      // 15 * 2.6 = 39
      expect(result.status).toBe('mastered');
    });
  });
});

describe('isCardDue', () => {
  it('should return true for past dates', () => {
    const pastDate = addDays(new Date(), -1);
    expect(isCardDue(pastDate)).toBe(true);
  });

  it('should return true for today', () => {
    const today = startOfDay(new Date());
    expect(isCardDue(today)).toBe(true);
  });

  it('should return false for future dates', () => {
    const futureDate = addDays(new Date(), 1);
    expect(isCardDue(futureDate)).toBe(false);
  });
});

describe('daysUntilReview', () => {
  it('should return 0 for today', () => {
    const today = startOfDay(new Date());
    expect(daysUntilReview(today)).toBe(0);
  });

  it('should return positive number for future dates', () => {
    const futureDate = addDays(new Date(), 5);
    expect(daysUntilReview(futureDate)).toBe(5);
  });

  it('should return negative number for past dates', () => {
    const pastDate = addDays(new Date(), -3);
    expect(daysUntilReview(pastDate)).toBe(-3);
  });
});

describe('getCardPriority', () => {
  const createMockProgress = (
    status: 'new' | 'learning' | 'review' | 'mastered',
    daysFromToday: number
  ): VocabProgress => ({
    vocabId: 'test-vocab',
    userId: 'test-user',
    status,
    interval: status === 'new' ? 0 : status === 'learning' ? 1 : 10,
    easeFactor: 2.5,
    repetitions: status === 'new' ? 0 : status === 'learning' ? 1 : 3,
    nextReview: {
      toDate: () => addDays(new Date(), daysFromToday),
    } as any,
    lastReviewed: {
      toDate: () => new Date(),
    } as any,
    reviewCount: 0,
  });

  it('should give highest priority to overdue cards', () => {
    const overdue = createMockProgress('review', -5);
    const priority = getCardPriority(overdue);
    expect(priority).toBeGreaterThan(1000);
  });

  it('should give higher priority to more overdue cards', () => {
    const slightlyOverdue = createMockProgress('review', -2);
    const veryOverdue = createMockProgress('review', -10);
    expect(getCardPriority(veryOverdue)).toBeGreaterThan(getCardPriority(slightlyOverdue));
  });

  it('should give learning cards priority 500', () => {
    const learning = createMockProgress('learning', 0);
    expect(getCardPriority(learning)).toBe(500);
  });

  it('should give new cards priority 100', () => {
    const newCard = createMockProgress('new', 0);
    expect(getCardPriority(newCard)).toBe(100);
  });

  it('should give non-overdue review cards priority 0', () => {
    const review = createMockProgress('review', 5);
    expect(getCardPriority(review)).toBe(0);
  });
});

describe('sortByPriority', () => {
  const createMockProgress = (
    id: string,
    status: 'new' | 'learning' | 'review' | 'mastered',
    daysFromToday: number
  ): VocabProgress => ({
    vocabId: id,
    userId: 'test-user',
    status,
    interval: status === 'new' ? 0 : status === 'learning' ? 1 : 10,
    easeFactor: 2.5,
    repetitions: status === 'new' ? 0 : status === 'learning' ? 1 : 3,
    nextReview: {
      toDate: () => addDays(new Date(), daysFromToday),
    } as any,
    lastReviewed: {
      toDate: () => new Date(),
    } as any,
    reviewCount: 0,
  });

  it('should sort cards with overdue first', () => {
    const overdue = createMockProgress('overdue', -3);
    const newCard = createMockProgress('new', 0);
    const review = createMockProgress('review', 5);
    
    const sorted = sortByPriority([newCard, review, overdue]);
    
    expect(sorted[0].vocabId).toBe('overdue');
    expect(sorted[1].vocabId).toBe('new');
    expect(sorted[2].vocabId).toBe('review');
  });

  it('should not mutate original array', () => {
    const cards = [
      createMockProgress('a', 'review', 1),
      createMockProgress('b', 'learning', 0),
    ];
    const originalFirst = cards[0];
    
    sortByPriority(cards);
    
    expect(cards[0]).toBe(originalFirst);
  });
});

describe('edge cases', () => {
  it('should handle quality 0 (complete blackout)', () => {
    const progress = { interval: 10, easeFactor: 2.5, repetitions: 5 };
    const result = calculateNextReview(progress, 0);
    
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  it('should handle very long intervals', () => {
    const progress = { interval: 100, easeFactor: 2.5, repetitions: 10 };
    const result = calculateNextReview(progress, 5);
    
    expect(result.interval).toBe(260); // 100 * 2.6 (EF increases for quality 5)
    expect(result.status).toBe('mastered');
  });

  it('should cap ease factor reduction', () => {
    // Start with minimum ease factor
    const progress = { interval: 6, easeFactor: 1.3, repetitions: 2 };
    const result = calculateNextReview(progress, 3);
    
    // Should not go below 1.3
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});

