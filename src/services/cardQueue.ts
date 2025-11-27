/**
 * Card Queue Builder
 * 
 * Creates an interleaved queue of new and review cards
 * for optimal learning: 1 new card, then 3-5 reviews, repeat.
 */

import type { StudyCard, VocabProgress } from '@/types';
import type { Vocabulary } from '@/types';
import { isCardDue, sortByPriority } from './srs';

export interface QueueOptions {
  maxNewCards: number;
  maxReviewCards: number;
  newCardsPerBatch: number;
  reviewCardsPerBatch: number;
}

export const DEFAULT_QUEUE_OPTIONS: QueueOptions = {
  maxNewCards: 20,
  maxReviewCards: 100,
  newCardsPerBatch: 1,
  reviewCardsPerBatch: 4, // 1 new + 4 reviews = 5 cards per batch
};

/**
 * Build an interleaved study queue
 * Pattern: 1 new card, then 3-5 review cards, repeat
 */
export function buildStudyQueue(
  allVocab: Vocabulary[],
  progressMap: Map<string, VocabProgress>,
  options: Partial<QueueOptions> = {}
): StudyCard[] {
  const opts = { ...DEFAULT_QUEUE_OPTIONS, ...options };
  
  // Separate cards into new and due for review
  const newCards: StudyCard[] = [];
  const dueCards: StudyCard[] = [];
  
  for (const vocab of allVocab) {
    const progress = progressMap.get(vocab.id);
    
    const studyCard: StudyCard = {
      vocab: {
        id: vocab.id,
        term: vocab.term,
        reading: vocab.reading,
        meaning: vocab.meaning,
        synonyms: vocab.synonyms,
        readingSynonyms: vocab.readingSynonyms,
        exampleJapanese: vocab.exampleJapanese,
        exampleEnglish: vocab.exampleEnglish,
      },
      progress,
      isNew: !progress || progress.status === 'new',
    };
    
    if (!progress || progress.status === 'new') {
      newCards.push(studyCard);
    } else if (isCardDue(progress.nextReview.toDate())) {
      dueCards.push(studyCard);
    }
  }
  
  // Sort due cards by priority (overdue first)
  const sortedDueCards = dueCards.sort((a, b) => {
    if (!a.progress || !b.progress) return 0;
    const priorityA = isCardDue(a.progress.nextReview.toDate()) ? 1 : 0;
    const priorityB = isCardDue(b.progress.nextReview.toDate()) ? 1 : 0;
    return priorityB - priorityA;
  });
  
  // Limit cards
  const limitedNewCards = newCards.slice(0, opts.maxNewCards);
  const limitedDueCards = sortedDueCards.slice(0, opts.maxReviewCards);
  
  // Build interleaved queue
  return interleaveCards(
    limitedNewCards,
    limitedDueCards,
    opts.newCardsPerBatch,
    opts.reviewCardsPerBatch
  );
}

/**
 * Interleave new and review cards
 * Pattern: N new cards, then R review cards, repeat
 */
function interleaveCards(
  newCards: StudyCard[],
  reviewCards: StudyCard[],
  newPerBatch: number,
  reviewPerBatch: number
): StudyCard[] {
  const queue: StudyCard[] = [];
  let newIndex = 0;
  let reviewIndex = 0;
  
  while (newIndex < newCards.length || reviewIndex < reviewCards.length) {
    // Add new cards for this batch
    for (let i = 0; i < newPerBatch && newIndex < newCards.length; i++) {
      queue.push(newCards[newIndex++]);
    }
    
    // Add review cards for this batch
    for (let i = 0; i < reviewPerBatch && reviewIndex < reviewCards.length; i++) {
      queue.push(reviewCards[reviewIndex++]);
    }
  }
  
  return queue;
}

/**
 * Get counts for UI display
 */
export function getQueueCounts(
  allVocab: Vocabulary[],
  progressMap: Map<string, VocabProgress>
): {
  newCount: number;
  dueCount: number;
  totalLearned: number;
  masteredCount: number;
} {
  let newCount = 0;
  let dueCount = 0;
  let totalLearned = 0;
  let masteredCount = 0;
  
  for (const vocab of allVocab) {
    const progress = progressMap.get(vocab.id);
    
    if (!progress || progress.status === 'new') {
      newCount++;
    } else {
      totalLearned++;
      
      if (progress.status === 'mastered') {
        masteredCount++;
      }
      
      if (isCardDue(progress.nextReview.toDate())) {
        dueCount++;
      }
    }
  }
  
  return { newCount, dueCount, totalLearned, masteredCount };
}

/**
 * Check if daily goal is reached
 */
export function isDailyGoalReached(
  cardsStudiedToday: number,
  dailyGoal: number
): boolean {
  return cardsStudiedToday >= dailyGoal;
}

/**
 * Calculate remaining cards to reach daily goal
 */
export function cardsUntilGoal(
  cardsStudiedToday: number,
  dailyGoal: number
): number {
  return Math.max(0, dailyGoal - cardsStudiedToday);
}

/**
 * Shuffle array (Fisher-Yates)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

