import {
  calculateXpEarned,
  calculateXpWithQuality,
  calculateLevel,
  getLevelProgress,
  xpForLevel,
  getLevelTitle,
  calculateStreakBonus,
  calculateSessionXp,
  calculateAccuracy,
  calculateXP,
  XP_PER_LEVEL,
  MAX_LEVEL,
} from '../xpCalculator';

describe('calculateXpEarned', () => {
  it('returns 2 for incorrect answers regardless of interval', () => {
    expect(calculateXpEarned(0, false)).toBe(2);
    expect(calculateXpEarned(100, false)).toBe(2);
  });

  it('returns 5 for new/learning cards (interval <= 1)', () => {
    expect(calculateXpEarned(0, true)).toBe(5);
    expect(calculateXpEarned(1, true)).toBe(5);
  });

  it('returns 10 for young cards (interval 2–7)', () => {
    expect(calculateXpEarned(2, true)).toBe(10);
    expect(calculateXpEarned(7, true)).toBe(10);
  });

  it('returns 20 for maturing cards (interval 8–30)', () => {
    expect(calculateXpEarned(8, true)).toBe(20);
    expect(calculateXpEarned(30, true)).toBe(20);
  });

  it('returns 25 for mature cards (interval 31–90)', () => {
    expect(calculateXpEarned(31, true)).toBe(25);
    expect(calculateXpEarned(90, true)).toBe(25);
  });

  it('returns 30 for well-established cards (interval > 90)', () => {
    expect(calculateXpEarned(91, true)).toBe(30);
    expect(calculateXpEarned(365, true)).toBe(30);
  });
});

describe('calculateXpWithQuality', () => {
  it('applies 20% bonus for quality 5', () => {
    const base = calculateXpEarned(7, true); // 10
    expect(calculateXpWithQuality(7, true, 5)).toBe(Math.round(base * 1.2));
  });

  it('applies 10% bonus for quality 4', () => {
    const base = calculateXpEarned(7, true); // 10
    expect(calculateXpWithQuality(7, true, 4)).toBe(Math.round(base * 1.1));
  });

  it('returns base XP for quality 3', () => {
    expect(calculateXpWithQuality(7, true, 3)).toBe(calculateXpEarned(7, true));
  });

  it('returns 2 for incorrect answers regardless of quality', () => {
    expect(calculateXpWithQuality(50, false, 5)).toBe(2);
    expect(calculateXpWithQuality(50, false, 0)).toBe(2);
  });
});

describe('calculateLevel', () => {
  it('starts at level 1 with 0 XP', () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it('advances to level 2 at exactly XP_PER_LEVEL', () => {
    expect(calculateLevel(XP_PER_LEVEL)).toBe(2);
  });

  it('stays within same level just before threshold', () => {
    expect(calculateLevel(XP_PER_LEVEL - 1)).toBe(1);
  });

  it('caps at MAX_LEVEL', () => {
    expect(calculateLevel(XP_PER_LEVEL * MAX_LEVEL * 10)).toBe(MAX_LEVEL);
  });
});

describe('getLevelProgress', () => {
  it('returns 0 progress at start of level', () => {
    const result = getLevelProgress(0);
    expect(result.level).toBe(1);
    expect(result.currentXp).toBe(0);
    expect(result.progress).toBe(0);
    expect(result.xpForNextLevel).toBe(XP_PER_LEVEL);
  });

  it('returns correct mid-level progress', () => {
    const result = getLevelProgress(XP_PER_LEVEL + 250); // level 2, halfway
    expect(result.level).toBe(2);
    expect(result.currentXp).toBe(250);
    expect(result.progress).toBeCloseTo(0.5);
  });

  it('clamps progress to 1 at max level', () => {
    const result = getLevelProgress(XP_PER_LEVEL * MAX_LEVEL * 10);
    expect(result.progress).toBe(1);
  });
});

describe('xpForLevel', () => {
  it('returns 0 for level 1', () => {
    expect(xpForLevel(1)).toBe(0);
  });

  it('returns XP_PER_LEVEL for level 2', () => {
    expect(xpForLevel(2)).toBe(XP_PER_LEVEL);
  });

  it('is consistent with calculateLevel', () => {
    for (let level = 1; level <= 10; level++) {
      expect(calculateLevel(xpForLevel(level))).toBe(level);
    }
  });
});

describe('getLevelTitle', () => {
  it('returns 初心者 for level 1–5', () => {
    expect(getLevelTitle(1)).toBe('初心者');
    expect(getLevelTitle(5)).toBe('初心者');
  });

  it('returns 学習者 for level 6–10', () => {
    expect(getLevelTitle(6)).toBe('学習者');
  });

  it('returns 伝説 for level > 75', () => {
    expect(getLevelTitle(76)).toBe('伝説');
    expect(getLevelTitle(100)).toBe('伝説');
  });
});

describe('calculateStreakBonus', () => {
  it('returns 0 for streak < 7', () => {
    expect(calculateStreakBonus(0)).toBe(0);
    expect(calculateStreakBonus(6)).toBe(0);
  });

  it('returns 5 for streak 7–29', () => {
    expect(calculateStreakBonus(7)).toBe(5);
    expect(calculateStreakBonus(29)).toBe(5);
  });

  it('returns 10 for streak 30–99', () => {
    expect(calculateStreakBonus(30)).toBe(10);
    expect(calculateStreakBonus(99)).toBe(10);
  });

  it('returns 20 for streak 100–364', () => {
    expect(calculateStreakBonus(100)).toBe(20);
  });

  it('returns 30 for streak >= 365', () => {
    expect(calculateStreakBonus(365)).toBe(30);
  });
});

describe('calculateSessionXp', () => {
  it('sums base XP across all results', () => {
    const results = [
      { interval: 1, correct: true, quality: 4 as const },
      { interval: 1, correct: true, quality: 4 as const },
    ];
    const { baseXp, totalXp } = calculateSessionXp(results, 0);
    expect(baseXp).toBeGreaterThan(0);
    expect(totalXp).toBe(baseXp); // no streak bonus
  });

  it('adds streak bonus when streak >= 7', () => {
    const results = [{ interval: 1, correct: true, quality: 4 as const }];
    const { baseXp, streakBonus, totalXp } = calculateSessionXp(results, 10);
    expect(streakBonus).toBe(5);
    expect(totalXp).toBe(baseXp + 5);
  });

  it('returns 0 base XP for empty results', () => {
    const { baseXp } = calculateSessionXp([], 0);
    expect(baseXp).toBe(0);
  });
});

describe('calculateAccuracy', () => {
  it('returns 0 for 0 total', () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it('returns 100 for all correct', () => {
    expect(calculateAccuracy(10, 10)).toBe(100);
  });

  it('returns 50 for half correct', () => {
    expect(calculateAccuracy(5, 10)).toBe(50);
  });

  it('rounds to nearest integer', () => {
    const result = calculateAccuracy(1, 3);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe('calculateXP (session summary)', () => {
  it('awards 10 XP per correct and 2 per incorrect', () => {
    const xp = calculateXP({ cardsReviewed: 5, correctAnswers: 3, newCardsLearned: 0, perfectSession: false, streakBonus: false });
    expect(xp).toBe(3 * 10 + 2 * 2); // 34
  });

  it('awards bonus XP for new cards learned', () => {
    const without = calculateXP({ cardsReviewed: 5, correctAnswers: 5, newCardsLearned: 0, perfectSession: false, streakBonus: false });
    const with2New = calculateXP({ cardsReviewed: 5, correctAnswers: 5, newCardsLearned: 2, perfectSession: false, streakBonus: false });
    expect(with2New).toBe(without + 10);
  });

  it('applies 25% perfect session bonus for >= 5 cards', () => {
    const base = calculateXP({ cardsReviewed: 5, correctAnswers: 5, newCardsLearned: 0, perfectSession: false, streakBonus: false });
    const perfect = calculateXP({ cardsReviewed: 5, correctAnswers: 5, newCardsLearned: 0, perfectSession: true, streakBonus: false });
    expect(perfect).toBe(Math.round(base * 1.25));
  });

  it('does NOT apply perfect bonus for < 5 cards', () => {
    const base = calculateXP({ cardsReviewed: 4, correctAnswers: 4, newCardsLearned: 0, perfectSession: false, streakBonus: false });
    const perfect = calculateXP({ cardsReviewed: 4, correctAnswers: 4, newCardsLearned: 0, perfectSession: true, streakBonus: false });
    expect(perfect).toBe(base);
  });

  it('adds 10 XP for streak bonus', () => {
    const without = calculateXP({ cardsReviewed: 5, correctAnswers: 5, newCardsLearned: 0, perfectSession: false, streakBonus: false });
    const with_ = calculateXP({ cardsReviewed: 5, correctAnswers: 5, newCardsLearned: 0, perfectSession: false, streakBonus: true });
    expect(with_).toBe(without + 10);
  });
});
