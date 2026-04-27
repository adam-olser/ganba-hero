/**
 * Firestore API - Web Version
 * 
 * Uses Firebase JS SDK for web platform.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  Timestamp,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { firebaseConfig } from '@/config/firebase';
import { calculateNextReview, DEFAULT_SRS_VALUES } from '@/services/srs';
import { calculateXP } from '@/services/xpCalculator';
import type {
  User,
  Vocabulary,
  GrammarPoint,
  VocabProgress,
  StudySession,
  ReviewResult,
  StudyCard,
} from '@/types';

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const db = getFirestore(app);

// Collection references
const usersRef = collection(db, 'users');
const vocabRef = collection(db, 'vocabularies');
const grammarRef = collection(db, 'grammarPoints');

// ========================
// User Operations
// ========================

export async function getUser(uid: string): Promise<User | null> {
  const docRef = doc(usersRef, uid);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    lastStudyDate: data.lastStudyDate?.toDate?.() || null,
  } as User;
}

export async function createUser(user: User): Promise<void> {
  const docRef = doc(usersRef, user.uid);
  await setDoc(docRef, {
    ...user,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUser(uid: string, updates: Partial<User>): Promise<void> {
  const docRef = doc(usersRef, uid);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// ========================
// Vocabulary Operations
// ========================

export async function getVocabByLevel(level: string): Promise<Vocabulary[]> {
  const q = query(vocabRef, where('jlptLevel', '==', level), orderBy('frequencyRank', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Vocabulary[];
}

export async function getVocabByIds(ids: string[]): Promise<Vocabulary[]> {
  if (ids.length === 0) return [];
  
  // Firestore 'in' query limited to 30 items
  const chunks = [];
  for (let i = 0; i < ids.length; i += 30) {
    chunks.push(ids.slice(i, i + 30));
  }
  
  const results: Vocabulary[] = [];
  for (const chunk of chunks) {
    const q = query(vocabRef, where('__name__', 'in', chunk));
    const snapshot = await getDocs(q);
    results.push(...snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Vocabulary[]);
  }
  
  return results;
}

export async function searchVocab(searchTerm: string, level?: string): Promise<Vocabulary[]> {
  // Note: Full-text search requires Algolia/ElasticSearch
  // For now, fetch all and filter client-side (not efficient for large datasets)
  const q = level 
    ? query(vocabRef, where('level', '==', level))
    : query(vocabRef, limit(100));
  
  const snapshot = await getDocs(q);
  const term = searchTerm.toLowerCase();
  
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }) as Vocabulary)
    .filter(vocab => 
      vocab.term.includes(term) ||
      vocab.reading.includes(term) ||
      vocab.meaning.toLowerCase().includes(term)
    );
}

// ========================
// Grammar Operations
// ========================

export async function getGrammarByLevel(level: string): Promise<GrammarPoint[]> {
  const q = query(grammarRef, where('level', '==', level), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as GrammarPoint[];
}

export async function getGrammarById(id: string): Promise<GrammarPoint | null> {
  const docRef = doc(grammarRef, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as GrammarPoint;
}

// ========================
// Progress Operations
// ========================

export async function getProgress(userId: string): Promise<VocabProgress[]> {
  const progressRef = collection(db, 'users', userId, 'progress');
  const snapshot = await getDocs(progressRef);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      nextReview: data.nextReview?.toDate?.() || new Date(),
      lastReviewed: data.lastReviewed?.toDate?.() || new Date(),
    };
  }) as VocabProgress[];
}

export async function getDueCards(userId: string): Promise<VocabProgress[]> {
  const progressRef = collection(db, 'users', userId, 'progress');
  const now = Timestamp.now();
  
  const q = query(
    progressRef,
    where('nextReview', '<=', now),
    orderBy('nextReview', 'asc'),
    limit(100)
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      nextReview: data.nextReview?.toDate?.() || new Date(),
      lastReviewed: data.lastReviewed?.toDate?.() || new Date(),
    };
  }) as VocabProgress[];
}

export async function updateProgress(
  userId: string,
  vocabId: string,
  progress: Partial<VocabProgress>
): Promise<void> {
  const progressRef = doc(db, 'users', userId, 'progress', vocabId);
  
  const data = {
    ...progress,
    vocabId,
    lastReviewed: serverTimestamp(),
  };
  
  // Convert Date to Timestamp if present
  if (progress.nextReview instanceof Date) {
    data.nextReview = Timestamp.fromDate(progress.nextReview);
  }
  
  await setDoc(progressRef, data, { merge: true });
}

// ========================
// Session Operations
// ========================

export async function recordStudySession(
  userId: string,
  session: Omit<StudySession, 'id' | 'startedAt' | 'completedAt'>
): Promise<string> {
  const sessionsRef = collection(db, 'users', userId, 'sessions');
  const sessionDoc = doc(sessionsRef);
  const date = new Date().toISOString().split('T')[0];

  await setDoc(sessionDoc, {
    ...session,
    date,
    startedAt: serverTimestamp(),
    completedAt: serverTimestamp(),
  });

  // Update user's total XP
  const userRef = doc(usersRef, userId);
  await updateDoc(userRef, {
    totalXp: increment(session.xpEarned),
    lastStudyDate: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Write daily stats so Progress screen can read them
  const dailyStatsRef = doc(db, 'users', userId, 'dailyStats', date);
  await setDoc(dailyStatsRef, {
    date,
    cardsReviewed: increment(session.cardsReviewed),
    newCardsLearned: increment((session as { newCardsLearned?: number }).newCardsLearned ?? 0),
    correctAnswers: increment((session as { correctAnswers?: number }).correctAnswers ?? 0),
    totalXpEarned: increment(session.xpEarned),
  }, { merge: true });

  return sessionDoc.id;
}

export async function getDailyStats(userId: string): Promise<{
  cardsStudied: number;
  xpEarned: number;
  accuracy: number;
}> {
  const sessionsRef = collection(db, 'users', userId, 'sessions');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const q = query(
    sessionsRef,
    where('completedAt', '>=', Timestamp.fromDate(today)),
    orderBy('completedAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  
  let cardsStudied = 0;
  let xpEarned = 0;
  let totalCorrect = 0;
  let totalReviews = 0;
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    cardsStudied += data.cardsReviewed || 0;
    xpEarned += data.xpEarned || 0;
    totalCorrect += data.correctAnswers || 0;
    totalReviews += data.cardsReviewed || 0;
  });
  
  return {
    cardsStudied,
    xpEarned,
    accuracy: totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0,
  };
}

export async function updateStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
}> {
  const user = await getUser(userId);
  if (!user) throw new Error('User not found');
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
  
  let currentStreak = user.currentStreak || 0;
  let longestStreak = user.longestStreak || 0;
  
  if (lastStudy) {
    const lastStudyDate = new Date(
      lastStudy.getFullYear(),
      lastStudy.getMonth(),
      lastStudy.getDate()
    );
    const daysDiff = Math.floor(
      (today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff === 0) {
      // Already studied today
    } else if (daysDiff === 1) {
      // Consecutive day
      currentStreak += 1;
    } else {
      // Streak broken
      currentStreak = 1;
    }
  } else {
    // First study session
    currentStreak = 1;
  }
  
  longestStreak = Math.max(longestStreak, currentStreak);
  
  await updateUser(userId, {
    currentStreak,
    longestStreak,
    lastStudyDate: now,
  });
  
  return { currentStreak, longestStreak };
}

/**
 * Persist a completed study session: SRS updates + stats + XP in one call.
 */
export async function saveSessionResults(
  uid: string,
  sessionData: {
    results: ReviewResult[];
    cards: StudyCard[];
    startedAt: Date;
    dailyGoal: number;
    currentStreak: number;
  }
): Promise<{ xpEarned: number }> {
  const { results, cards, startedAt, dailyGoal, currentStreak } = sessionData;
  const durationMinutes = Math.max(1, Math.round((Date.now() - startedAt.getTime()) / 60000));
  const totalCards = results.length;
  const correctAnswers = results.filter(r => r.correct).length;
  const newCardsLearned = results.filter(
    r => cards.find(c => c.vocab.id === r.vocabId)?.isNew && r.correct
  ).length;

  const xpEarned = calculateXP({
    cardsReviewed: totalCards,
    correctAnswers,
    newCardsLearned,
    perfectSession: correctAnswers === totalCards,
    streakBonus: currentStreak >= 7,
  });

  const now = Timestamp.now();
  const batch = writeBatch(db);

  for (const result of results) {
    const card = cards.find(c => c.vocab.id === result.vocabId);
    if (!card) continue;

    const currentSRS = card.progress ?? DEFAULT_SRS_VALUES;
    const srsUpdate = calculateNextReview(currentSRS, result.quality);

    const progressRef = doc(db, 'users', uid, 'progress', result.vocabId);
    batch.set(progressRef, {
      vocabId: result.vocabId,
      interval: srsUpdate.interval,
      easeFactor: srsUpdate.easeFactor,
      repetitions: srsUpdate.repetitions,
      nextReview: Timestamp.fromDate(srsUpdate.nextReview),
      lastReviewed: now,
      status: srsUpdate.status,
      correctCount: increment(result.correct ? 1 : 0),
      incorrectCount: increment(result.correct ? 0 : 1),
    }, { merge: true });
  }

  await batch.commit();

  await recordStudySession(uid, {
    cardsReviewed: totalCards,
    newCardsLearned,
    correctAnswers,
    incorrectAnswers: totalCards - correctAnswers,
    xpEarned,
    goalCompleted: totalCards >= dailyGoal,
    durationMinutes,
  } as Parameters<typeof recordStudySession>[1]);

  return { xpEarned };
}

/**
 * Get user's vocabulary progress map
 */
export async function getUserProgress(userId: string): Promise<Map<string, VocabProgress>> {
  const progressRef = collection(db, 'users', userId, 'progress');
  const snapshot = await getDocs(progressRef);
  
  const progressMap = new Map<string, VocabProgress>();
  snapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    progressMap.set(docSnap.id, {
      vocabId: docSnap.id,
      ...data,
      nextReview: data.nextReview?.toDate?.() || new Date(),
      lastReview: data.lastReview?.toDate?.() || null,
    } as VocabProgress);
  });
  
  return progressMap;
}

/**
 * Get weekly stats for last 35 days (5 weeks)
 */
export async function getWeeklyStats(userId: string): Promise<Array<{
  date: string;
  cardsReviewed: number;
  correctAnswers: number;
  xpEarned: number;
}>> {
  const dailyStatsRef = collection(db, 'users', userId, 'dailyStats');
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 35);
  
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];
  
  const q = query(
    dailyStatsRef,
    where('date', '>=', startStr),
    where('date', '<=', endStr),
    orderBy('date', 'asc')
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      date: data.date,
      cardsReviewed: data.cardsReviewed || 0,
      correctAnswers: data.correctAnswers || 0,
      xpEarned: data.totalXpEarned || 0,
    };
  });
}

