/**
 * SRS (Spaced Repetition System) Tests
 * 
 * Tests for the SM-2 algorithm implementation.
 */

import {
  calculateNextReview,
  isCardDue,
  daysUntilReview,
  DEFAULT_SRS_VALUES,
  type Quality,
} from '../../src/services/srs';
import { addDays, startOfDay } from 'date-fns';

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

