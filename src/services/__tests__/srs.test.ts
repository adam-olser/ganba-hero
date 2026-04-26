import { addDays, startOfDay } from 'date-fns';
import {
  calculateNextReview,
  isCardDue,
  daysUntilReview,
  DEFAULT_SRS_VALUES,
  type Quality,
} from '../srs';

const BASE = DEFAULT_SRS_VALUES; // { interval: 0, easeFactor: 2.5, repetitions: 0 }

describe('calculateNextReview', () => {
  describe('first correct review (repetitions=0, quality>=3)', () => {
    it('sets interval to 1 and increments repetitions', () => {
      const result = calculateNextReview(BASE, 4);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    it('sets status to learning for interval 1', () => {
      const result = calculateNextReview(BASE, 4);
      expect(result.status).toBe('learning');
    });

    it('schedules nextReview for tomorrow', () => {
      const result = calculateNextReview(BASE, 4);
      const tomorrow = startOfDay(addDays(new Date(), 1));
      expect(result.nextReview.getTime()).toBe(tomorrow.getTime());
    });
  });

  describe('second correct review (repetitions=1, quality>=3)', () => {
    it('sets interval to 6 and increments repetitions', () => {
      const result = calculateNextReview({ ...BASE, repetitions: 1, interval: 1 }, 4);
      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
    });

    it('sets status to review for interval 6', () => {
      const result = calculateNextReview({ ...BASE, repetitions: 1, interval: 1 }, 4);
      expect(result.status).toBe('review');
    });
  });

  describe('subsequent correct reviews (repetitions>=2)', () => {
    it('multiplies interval by easeFactor', () => {
      const progress = { interval: 6, easeFactor: 2.5, repetitions: 2 };
      const result = calculateNextReview(progress, 4);
      expect(result.interval).toBe(Math.round(6 * 2.5));
    });

    it('marks mastered when interval >= 21', () => {
      const progress = { interval: 10, easeFactor: 2.5, repetitions: 3 };
      const result = calculateNextReview(progress, 5); // interval = round(10 * 2.5) = 25
      expect(result.status).toBe('mastered');
    });
  });

  describe('incorrect answer (quality < 3)', () => {
    it.each([0, 1, 2] as Quality[])('resets interval and repetitions for quality %i', (quality) => {
      const progress = { interval: 15, easeFactor: 2.5, repetitions: 4 };
      const result = calculateNextReview(progress, quality);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
    });

    it('sets status to learning after reset', () => {
      const result = calculateNextReview({ interval: 10, easeFactor: 2.5, repetitions: 3 }, 0);
      expect(result.status).toBe('learning');
    });
  });

  describe('ease factor adjustment', () => {
    it('increases ease factor for quality 5 (perfect)', () => {
      const result = calculateNextReview(BASE, 5);
      expect(result.easeFactor).toBeGreaterThan(BASE.easeFactor);
    });

    it('decreases ease factor for quality 3', () => {
      const result = calculateNextReview(BASE, 3);
      expect(result.easeFactor).toBeLessThan(BASE.easeFactor);
    });

    it('never drops ease factor below 1.3', () => {
      let progress = { ...BASE, easeFactor: 1.31 };
      for (let i = 0; i < 10; i++) {
        const result = calculateNextReview(progress, 0);
        progress = { ...progress, easeFactor: result.easeFactor };
        expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
      }
    });

    it('rounds ease factor to 2 decimal places', () => {
      const result = calculateNextReview(BASE, 4);
      const decimals = result.easeFactor.toString().split('.')[1]?.length ?? 0;
      expect(decimals).toBeLessThanOrEqual(2);
    });
  });

  describe('status thresholds', () => {
    it('review for interval 2–20', () => {
      const progress = { interval: 6, easeFactor: 2.0, repetitions: 2 };
      const result = calculateNextReview(progress, 4); // interval = round(6 * 2.0) = 12
      expect(result.status).toBe('review');
    });

    it('mastered for interval >= 21', () => {
      const progress = { interval: 9, easeFactor: 2.5, repetitions: 3 };
      const result = calculateNextReview(progress, 4); // interval = round(9 * 2.5) = 23
      expect(result.status).toBe('mastered');
    });
  });
});

describe('isCardDue', () => {
  it('returns true for past dates', () => {
    const pastDate = addDays(new Date(), -3);
    expect(isCardDue(pastDate)).toBe(true);
  });

  it('returns true for today', () => {
    expect(isCardDue(new Date())).toBe(true);
  });

  it('returns false for future dates', () => {
    const futureDate = addDays(new Date(), 3);
    expect(isCardDue(futureDate)).toBe(false);
  });
});

describe('daysUntilReview', () => {
  it('returns positive number for future dates', () => {
    const future = addDays(new Date(), 5);
    expect(daysUntilReview(future)).toBe(5);
  });

  it('returns 0 for today', () => {
    expect(daysUntilReview(new Date())).toBe(0);
  });

  it('returns negative number for past dates', () => {
    const past = addDays(new Date(), -2);
    expect(daysUntilReview(past)).toBe(-2);
  });
});
