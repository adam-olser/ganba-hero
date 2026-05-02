import { addDays, subDays, startOfDay } from 'date-fns';
import { buildStudyQueue, getQueueCounts, DEFAULT_QUEUE_OPTIONS } from '../cardQueue';
import type { QueueOptions } from '../cardQueue';
import type { VocabProgress } from '@/types/progress';
import type { Vocabulary } from '@/types/vocabulary';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeVocab(id: string): Vocabulary {
  return {
    id,
    term: `term_${id}`,
    reading: `reading_${id}`,
    meaning: `meaning_${id}`,
    synonyms: [],
    readingSynonyms: [],
    jlptLevel: 'N5',
    frequencyRank: 1,
    partOfSpeech: 'noun',
    tags: [],
  };
}

function makeProgress(
  vocabId: string,
  overrides: Partial<VocabProgress> = {}
): VocabProgress {
  return {
    vocabId,
    interval: 6,
    easeFactor: 2.5,
    repetitions: 2,
    lastReviewed: null,
    correctCount: 5,
    incorrectCount: 1,
    status: 'review',
    nextReview: startOfDay(new Date()),
    ...overrides,
  } as VocabProgress;
}

// ---------------------------------------------------------------------------
// Test data factories
// ---------------------------------------------------------------------------

const DEFAULT_OPTS: Partial<QueueOptions> = {
  maxNewCards: DEFAULT_QUEUE_OPTIONS.maxNewCards,
  maxReviewCards: DEFAULT_QUEUE_OPTIONS.maxReviewCards,
  newCardsPerBatch: 1,
  reviewCardsPerBatch: 4,
};

// ---------------------------------------------------------------------------
// buildStudyQueue
// ---------------------------------------------------------------------------

describe('buildStudyQueue', () => {
  it('returns an empty queue when there are no vocab items', () => {
    const queue = buildStudyQueue([], new Map(), DEFAULT_OPTS);
    expect(queue).toHaveLength(0);
  });

  it('returns an empty queue when vocab list is populated but progress map is empty and cards are treated as new with a 0-limit', () => {
    const vocab = [makeVocab('v1'), makeVocab('v2')];
    const queue = buildStudyQueue(vocab, new Map(), { maxNewCards: 0, maxReviewCards: 100 });
    expect(queue).toHaveLength(0);
  });

  describe('only new cards (no progress records)', () => {
    it('includes cards with no progress entry as new cards', () => {
      const vocab = [makeVocab('v1'), makeVocab('v2'), makeVocab('v3')];
      const queue = buildStudyQueue(vocab, new Map(), DEFAULT_OPTS);
      expect(queue).toHaveLength(3);
      queue.forEach((card) => expect(card.isNew).toBe(true));
    });

    it('respects maxNewCards limit', () => {
      const vocab = Array.from({ length: 10 }, (_, i) => makeVocab(`v${i}`));
      const queue = buildStudyQueue(vocab, new Map(), { ...DEFAULT_OPTS, maxNewCards: 3 });
      const newCards = queue.filter((c) => c.isNew);
      expect(newCards).toHaveLength(3);
    });

    it('marks cards with status "new" in the progress map as new cards', () => {
      const vocab = [makeVocab('v1')];
      const progressMap = new Map([
        [
          'v1',
          makeProgress('v1', {
            status: 'new',
            interval: 0,
            repetitions: 0,
            nextReview: new Date(), // due today, but status is new so treated as new card
          }),
        ],
      ]);
      const queue = buildStudyQueue(vocab, progressMap, DEFAULT_OPTS);
      expect(queue).toHaveLength(1);
      expect(queue[0].isNew).toBe(true);
    });
  });

  describe('only due review cards', () => {
    it('includes due cards when no new cards are present', () => {
      const vocab = [makeVocab('v1'), makeVocab('v2')];
      const progressMap = new Map([
        ['v1', makeProgress('v1', { status: 'review', nextReview: subDays(new Date(), 1) })],
        ['v2', makeProgress('v2', { status: 'review', nextReview: subDays(new Date(), 2) })],
      ]);
      const queue = buildStudyQueue(vocab, progressMap, { ...DEFAULT_OPTS, maxNewCards: 0 });
      expect(queue).toHaveLength(2);
      queue.forEach((card) => expect(card.isNew).toBe(false));
    });

    it('respects maxReviewCards limit', () => {
      const vocab = Array.from({ length: 10 }, (_, i) => makeVocab(`v${i}`));
      const progressMap = new Map(
        vocab.map((v) => [
          v.id,
          makeProgress(v.id, { status: 'review', nextReview: subDays(new Date(), 1) }),
        ])
      );
      const queue = buildStudyQueue(vocab, progressMap, {
        maxNewCards: 0,
        maxReviewCards: 4,
      });
      expect(queue).toHaveLength(4);
    });
  });

  describe('interleave pattern — 1 new then 4 reviews', () => {
    it('interleaves new and due cards in the configured batch pattern', () => {
      // 3 new + 8 due → batches: [new, due, due, due, due], [new, due, due, due, due], [new]
      const newVocab = Array.from({ length: 3 }, (_, i) => makeVocab(`new${i}`));
      const dueVocab = Array.from({ length: 8 }, (_, i) => makeVocab(`due${i}`));

      const progressMap = new Map(
        dueVocab.map((v) => [
          v.id,
          makeProgress(v.id, { status: 'review', nextReview: subDays(new Date(), 1) }),
        ])
      );

      const queue = buildStudyQueue([...newVocab, ...dueVocab], progressMap, {
        maxNewCards: 20,
        maxReviewCards: 100,
        newCardsPerBatch: 1,
        reviewCardsPerBatch: 4,
      });

      // Total: 3 new + 8 due = 11
      expect(queue).toHaveLength(11);

      // First card should be new
      expect(queue[0].isNew).toBe(true);
      // Cards 1-4 should be reviews
      expect(queue[1].isNew).toBe(false);
      expect(queue[2].isNew).toBe(false);
      expect(queue[3].isNew).toBe(false);
      expect(queue[4].isNew).toBe(false);
      // 6th card is the second batch's new card
      expect(queue[5].isNew).toBe(true);
    });

    it('produces only new cards when there are no due cards', () => {
      const vocab = Array.from({ length: 3 }, (_, i) => makeVocab(`v${i}`));
      const queue = buildStudyQueue(vocab, new Map(), DEFAULT_OPTS);
      expect(queue.every((c) => c.isNew)).toBe(true);
    });

    it('produces only review cards when there are no new cards available', () => {
      const vocab = [makeVocab('v1'), makeVocab('v2')];
      const progressMap = new Map([
        ['v1', makeProgress('v1', { status: 'review', nextReview: subDays(new Date(), 1) })],
        ['v2', makeProgress('v2', { status: 'review', nextReview: subDays(new Date(), 2) })],
      ]);
      const queue = buildStudyQueue(vocab, progressMap, { ...DEFAULT_OPTS, maxNewCards: 0 });
      expect(queue.every((c) => !c.isNew)).toBe(true);
    });
  });

  describe('due card ordering — most overdue first', () => {
    it('places the more overdue card before the less overdue card', () => {
      const vocab = [makeVocab('recent'), makeVocab('old')];
      const progressMap = new Map([
        // 'recent' is 1 day overdue
        ['recent', makeProgress('recent', { status: 'review', nextReview: subDays(new Date(), 1) })],
        // 'old' is 10 days overdue — should come first
        ['old', makeProgress('old', { status: 'review', nextReview: subDays(new Date(), 10) })],
      ]);

      const queue = buildStudyQueue(vocab, progressMap, {
        maxNewCards: 0,
        maxReviewCards: 100,
      });

      expect(queue).toHaveLength(2);
      expect(queue[0].vocab.id).toBe('old');
      expect(queue[1].vocab.id).toBe('recent');
    });

    it('places three due cards in descending overdue order', () => {
      const vocab = [makeVocab('a'), makeVocab('b'), makeVocab('c')];
      const progressMap = new Map([
        ['a', makeProgress('a', { status: 'review', nextReview: subDays(new Date(), 5) })],
        ['b', makeProgress('b', { status: 'review', nextReview: subDays(new Date(), 20) })],
        ['c', makeProgress('c', { status: 'review', nextReview: subDays(new Date(), 1) })],
      ]);

      const queue = buildStudyQueue(vocab, progressMap, {
        maxNewCards: 0,
        maxReviewCards: 100,
      });

      const ids = queue.map((card) => card.vocab.id);
      expect(ids).toEqual(['b', 'a', 'c']); // 20 days > 5 days > 1 day overdue
    });
  });

  describe('mastered cards', () => {
    it('excludes mastered cards that are not yet due', () => {
      const vocab = [makeVocab('mastered')];
      const progressMap = new Map([
        [
          'mastered',
          makeProgress('mastered', {
            status: 'mastered',
            interval: 30,
            nextReview: addDays(new Date(), 15), // not due yet
          }),
        ],
      ]);

      const queue = buildStudyQueue(vocab, progressMap, DEFAULT_OPTS);
      expect(queue).toHaveLength(0);
    });

    it('includes mastered cards that ARE due', () => {
      const vocab = [makeVocab('mastered')];
      const progressMap = new Map([
        [
          'mastered',
          makeProgress('mastered', {
            status: 'mastered',
            interval: 30,
            nextReview: subDays(new Date(), 1), // overdue
          }),
        ],
      ]);

      const queue = buildStudyQueue(vocab, progressMap, DEFAULT_OPTS);
      expect(queue).toHaveLength(1);
      expect(queue[0].isNew).toBe(false);
    });
  });

  describe('StudyCard shape', () => {
    it('attaches progress to non-new cards', () => {
      const vocab = [makeVocab('v1')];
      const progress = makeProgress('v1', { status: 'review', nextReview: subDays(new Date(), 1) });
      const progressMap = new Map([['v1', progress]]);

      const queue = buildStudyQueue(vocab, progressMap, DEFAULT_OPTS);

      expect(queue[0].progress).not.toBeNull();
      expect(queue[0].progress!.vocabId).toBe('v1');
    });

    it('sets progress to null for new cards with no progress record', () => {
      const vocab = [makeVocab('v1')];
      const queue = buildStudyQueue(vocab, new Map(), DEFAULT_OPTS);

      expect(queue[0].progress).toBeNull();
    });

    it('maps vocab fields correctly onto StudyCard', () => {
      const v = makeVocab('v1');
      const queue = buildStudyQueue([v], new Map(), DEFAULT_OPTS);

      expect(queue[0].vocab.id).toBe('v1');
      expect(queue[0].vocab.term).toBe('term_v1');
      expect(queue[0].vocab.reading).toBe('reading_v1');
      expect(queue[0].vocab.meaning).toBe('meaning_v1');
    });
  });
});

// ---------------------------------------------------------------------------
// getQueueCounts
// ---------------------------------------------------------------------------

describe('getQueueCounts', () => {
  it('returns all zeros for empty vocab list', () => {
    const counts = getQueueCounts([], new Map());
    expect(counts).toEqual({ newCount: 0, dueCount: 0, totalLearned: 0, masteredCount: 0 });
  });

  it('counts vocab with no progress entry as new', () => {
    const vocab = [makeVocab('v1'), makeVocab('v2')];
    const { newCount } = getQueueCounts(vocab, new Map());
    expect(newCount).toBe(2);
  });

  it('counts vocab with status "new" in progress map as new', () => {
    const vocab = [makeVocab('v1')];
    const progressMap = new Map([
      ['v1', makeProgress('v1', { status: 'new', interval: 0, nextReview: new Date() })],
    ]);
    const { newCount } = getQueueCounts(vocab, progressMap);
    expect(newCount).toBe(1);
  });

  it('counts due review cards correctly', () => {
    const vocab = [makeVocab('v1'), makeVocab('v2'), makeVocab('v3')];
    const progressMap = new Map([
      ['v1', makeProgress('v1', { status: 'review', nextReview: subDays(new Date(), 2) })],
      ['v2', makeProgress('v2', { status: 'review', nextReview: subDays(new Date(), 1) })],
      // v3 is due in the future — not due
      ['v3', makeProgress('v3', { status: 'review', nextReview: addDays(new Date(), 3) })],
    ]);

    const { dueCount } = getQueueCounts(vocab, progressMap);
    expect(dueCount).toBe(2);
  });

  it('counts mastered cards separately', () => {
    const vocab = [makeVocab('v1'), makeVocab('v2')];
    const progressMap = new Map([
      ['v1', makeProgress('v1', { status: 'mastered', nextReview: addDays(new Date(), 10) })],
      ['v2', makeProgress('v2', { status: 'review', nextReview: addDays(new Date(), 2) })],
    ]);

    const { masteredCount, totalLearned } = getQueueCounts(vocab, progressMap);
    expect(masteredCount).toBe(1);
    expect(totalLearned).toBe(2); // both v1 and v2 have been learned
  });

  it('does not count new cards in totalLearned', () => {
    const vocab = [makeVocab('v1'), makeVocab('v2')];
    // v1 has progress as review, v2 has no progress (new)
    const progressMap = new Map([
      ['v1', makeProgress('v1', { status: 'review', nextReview: addDays(new Date(), 1) })],
    ]);

    const { totalLearned, newCount } = getQueueCounts(vocab, progressMap);
    expect(newCount).toBe(1);
    expect(totalLearned).toBe(1);
  });

  it('returns consistent counts across a mixed vocab set', () => {
    const vocab = [
      makeVocab('new1'),   // no progress → new
      makeVocab('due1'),   // overdue review
      makeVocab('due2'),   // overdue mastered
      makeVocab('notDue'), // review, not yet due
      makeVocab('notDue2'), // mastered, not yet due
    ];

    const progressMap = new Map([
      ['due1',   makeProgress('due1',   { status: 'review',   nextReview: subDays(new Date(), 3) })],
      ['due2',   makeProgress('due2',   { status: 'mastered', nextReview: subDays(new Date(), 1) })],
      ['notDue', makeProgress('notDue', { status: 'review',   nextReview: addDays(new Date(), 5) })],
      ['notDue2',makeProgress('notDue2',{ status: 'mastered', nextReview: addDays(new Date(), 15) })],
    ]);

    const counts = getQueueCounts(vocab, progressMap);
    expect(counts.newCount).toBe(1);       // new1
    expect(counts.dueCount).toBe(2);       // due1 + due2
    expect(counts.totalLearned).toBe(4);   // all 4 with progress records
    expect(counts.masteredCount).toBe(2);  // due2 + notDue2
  });
});
