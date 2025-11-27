/**
 * Study Store (Zustand)
 * 
 * Manages study session state, current card, and progress.
 */

import { create } from 'zustand';
import type { StudyCard, ReviewResult } from '@/types';

export type SessionMode = 'recognition' | 'recall' | 'mixed';

interface StudySession {
  mode: SessionMode;
  queue: StudyCard[];
  currentIndex: number;
  results: ReviewResult[];
  startedAt: Date;
  isPaused: boolean;
}

interface StudyState {
  // Session state
  session: StudySession | null;
  isLoading: boolean;
  
  // Daily progress
  cardsStudiedToday: number;
  dailyGoal: number;
  
  // Actions
  startSession: (queue: StudyCard[], mode: SessionMode) => void;
  endSession: () => StudySession | null;
  nextCard: () => void;
  previousCard: () => void;
  recordResult: (result: ReviewResult) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  setDailyGoal: (goal: number) => void;
  incrementCardsStudied: () => void;
  resetDailyProgress: () => void;
  setLoading: (loading: boolean) => void;
}

export const useStudyStore = create<StudyState>((set, get) => ({
  // Initial state
  session: null,
  isLoading: false,
  cardsStudiedToday: 0,
  dailyGoal: 5,
  
  // Actions
  startSession: (queue, mode) => set({
    session: {
      mode,
      queue,
      currentIndex: 0,
      results: [],
      startedAt: new Date(),
      isPaused: false,
    },
  }),
  
  endSession: () => {
    const { session } = get();
    set({ session: null });
    return session;
  },
  
  nextCard: () => set((state) => {
    if (!state.session) return state;
    const nextIndex = Math.min(
      state.session.currentIndex + 1,
      state.session.queue.length - 1
    );
    return {
      session: { ...state.session, currentIndex: nextIndex },
    };
  }),
  
  previousCard: () => set((state) => {
    if (!state.session) return state;
    const prevIndex = Math.max(state.session.currentIndex - 1, 0);
    return {
      session: { ...state.session, currentIndex: prevIndex },
    };
  }),
  
  recordResult: (result) => set((state) => {
    if (!state.session) return state;
    return {
      session: {
        ...state.session,
        results: [...state.session.results, result],
      },
      cardsStudiedToday: state.cardsStudiedToday + 1,
    };
  }),
  
  pauseSession: () => set((state) => ({
    session: state.session ? { ...state.session, isPaused: true } : null,
  })),
  
  resumeSession: () => set((state) => ({
    session: state.session ? { ...state.session, isPaused: false } : null,
  })),
  
  setDailyGoal: (dailyGoal) => set({ dailyGoal }),
  
  incrementCardsStudied: () => set((state) => ({
    cardsStudiedToday: state.cardsStudiedToday + 1,
  })),
  
  resetDailyProgress: () => set({ cardsStudiedToday: 0 }),
  
  setLoading: (isLoading) => set({ isLoading }),
}));

// Selectors
export const selectCurrentCard = (state: StudyState): StudyCard | null => {
  if (!state.session) return null;
  return state.session.queue[state.session.currentIndex] ?? null;
};

export const selectSessionProgress = (state: StudyState) => {
  if (!state.session) return { current: 0, total: 0, percentage: 0 };
  const current = state.session.currentIndex + 1;
  const total = state.session.queue.length;
  const percentage = total > 0 ? (current / total) * 100 : 0;
  return { current, total, percentage };
};

export const selectDailyProgress = (state: StudyState) => {
  const { cardsStudiedToday, dailyGoal } = state;
  const percentage = dailyGoal > 0 ? Math.min((cardsStudiedToday / dailyGoal) * 100, 100) : 0;
  const remaining = Math.max(dailyGoal - cardsStudiedToday, 0);
  const isComplete = cardsStudiedToday >= dailyGoal;
  return { cardsStudiedToday, dailyGoal, percentage, remaining, isComplete };
};

export const selectSessionStats = (state: StudyState) => {
  if (!state.session) return null;
  const { results } = state.session;
  const correct = results.filter(r => r.correct).length;
  const incorrect = results.filter(r => !r.correct).length;
  const total = results.length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  return { correct, incorrect, total, accuracy };
};

