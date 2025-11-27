import type { Timestamp } from '@react-native-firebase/firestore';

export type CardStatus = 'new' | 'learning' | 'review' | 'mastered';

export interface VocabProgress {
  vocabId: string;

  // SM-2 Algorithm fields
  interval: number; // Days until next review
  easeFactor: number; // Default 2.5, minimum 1.3
  repetitions: number; // Consecutive correct answers

  // Scheduling
  lastReviewed: Timestamp | null;
  nextReview: Timestamp;

  // Statistics
  correctCount: number;
  incorrectCount: number;

  // State
  status: CardStatus;
}

export interface GrammarProgress {
  grammarId: string;
  studied: boolean;
  lastStudied: Timestamp | null;
  confidenceLevel: 1 | 2 | 3 | 4 | 5;
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  startedAt: Timestamp;
  endedAt: Timestamp | null;
  cardsReviewed: number;
  newCardsLearned: number;
  correctAnswers: number;
  incorrectAnswers: number;
  xpEarned: number;
  goalCompleted: boolean;
  durationMinutes: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  cardsReviewed: number;
  newCardsLearned: number;
  correctAnswers: number;
  totalXpEarned: number;
  studyTimeMinutes: number;
  goalCompleted: boolean;
}

// Review result from flashcard session
export interface ReviewResult {
  vocabId: string;
  correct: boolean;
  answerGiven: string;
  timeTakenMs: number;
  quality: 0 | 1 | 2 | 3 | 4 | 5; // SM-2 quality rating
}

// Card for study session
export interface StudyCard {
  vocab: {
    id: string;
    term: string;
    reading: string;
    meaning: string;
    synonyms: string[];
    readingSynonyms: string[];
    exampleJapanese?: string;
    exampleEnglish?: string;
  };
  progress: VocabProgress | null;
  isNew: boolean;
}

// Default progress for new cards
export function createNewProgress(vocabId: string, nextReviewDate: Date): Omit<VocabProgress, 'lastReviewed' | 'nextReview'> {
  return {
    vocabId,
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    correctCount: 0,
    incorrectCount: 0,
    status: 'new',
  };
}

