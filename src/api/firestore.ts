/**
 * Firestore API
 * 
 * Database operations for users, vocabulary, and progress.
 */

import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import type { User, Vocabulary, GrammarPoint, VocabProgress, JlptLevel, ReviewResult, StudyCard, KanjiCard, KanjiProgress } from '@/types';
import { calculateNextReview, DEFAULT_SRS_VALUES } from '@/services/srs';
import { calculateXP } from '@/services/xpCalculator';

const db = firestore();

// ============================================
// USER OPERATIONS
// ============================================

/**
 * Get user document by ID
 */
export async function getUser(uid: string): Promise<User | null> {
  const doc = await db.collection('users').doc(uid).get();
  if (!doc.exists) return null;
  return { ...doc.data(), uid: doc.id } as User;
}

/**
 * Create new user document
 */
export async function createUser(user: User): Promise<void> {
  await db.collection('users').doc(user.uid).set({
    ...user,
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Update user document
 */
export async function updateUser(uid: string, data: Partial<User>): Promise<void> {
  await db.collection('users').doc(uid).update({
    ...data,
    lastActiveAt: firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  uid: string,
  settings: Partial<User['settings']>
): Promise<void> {
  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(settings)) {
    updates[`settings.${key}`] = value;
  }
  await db.collection('users').doc(uid).update(updates);
}

/**
 * Subscribe to user document changes
 */
export function subscribeToUser(
  uid: string,
  callback: (user: User | null) => void
): () => void {
  return db.collection('users').doc(uid).onSnapshot(
    (doc) => {
      if (!doc.exists) {
        callback(null);
        return;
      }
      callback({ ...doc.data(), uid: doc.id } as User);
    },
    (error) => {
      console.error('Error subscribing to user:', error);
      callback(null);
    }
  );
}

// ============================================
// VOCABULARY OPERATIONS
// ============================================

/**
 * Get vocabulary by JLPT level
 */
export async function getVocabByLevel(level: JlptLevel): Promise<Vocabulary[]> {
  const snapshot = await db
    .collection('vocabularies')
    .where('jlptLevel', '==', level)
    .orderBy('frequencyRank', 'asc')
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vocabulary));
}

/**
 * Get vocabulary by ID
 */
export async function getVocabById(id: string): Promise<Vocabulary | null> {
  const doc = await db.collection('vocabularies').doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Vocabulary;
}

/**
 * Get multiple vocabulary items by IDs
 */
export async function getVocabByIds(ids: string[]): Promise<Vocabulary[]> {
  if (ids.length === 0) return [];
  
  // Firestore limits 'in' queries to 10 items
  const chunks = [];
  for (let i = 0; i < ids.length; i += 10) {
    chunks.push(ids.slice(i, i + 10));
  }
  
  const results: Vocabulary[] = [];
  for (const chunk of chunks) {
    const snapshot = await db
      .collection('vocabularies')
      .where(firestore.FieldPath.documentId(), 'in', chunk)
      .get();
    results.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vocabulary)));
  }
  
  return results;
}

// ============================================
// GRAMMAR OPERATIONS
// ============================================

/**
 * Get grammar points by JLPT level
 */
export async function getGrammarByLevel(level: JlptLevel): Promise<GrammarPoint[]> {
  const snapshot = await db
    .collection('grammarPoints')
    .where('jlptLevel', '==', level)
    .orderBy('order', 'asc')
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GrammarPoint));
}

/**
 * Get grammar point by ID
 */
export async function getGrammarById(id: string): Promise<GrammarPoint | null> {
  const doc = await db.collection('grammarPoints').doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as GrammarPoint;
}

// ============================================
// PROGRESS OPERATIONS
// ============================================

/**
 * Get user's vocabulary progress.
 * @param limitCount - Maximum number of progress records to fetch (default 500).
 */
export async function getUserProgress(uid: string, limitCount = 500): Promise<Map<string, VocabProgress>> {
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('progress')
    .limit(limitCount)
    .get();
  
  const progressMap = new Map<string, VocabProgress>();
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    progressMap.set(doc.id, {
      ...data,
      vocabId: doc.id,
      nextReview: data.nextReview?.toDate?.() ?? new Date(),
      lastReviewed: data.lastReviewed?.toDate?.() ?? null,
    } as VocabProgress);
  });

  return progressMap;
}

/**
 * Get due cards for user
 */
export async function getDueCards(uid: string): Promise<VocabProgress[]> {
  const now = firestore.Timestamp.now();
  
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('progress')
    .where('nextReview', '<=', now)
    .get();
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      vocabId: doc.id,
      nextReview: data.nextReview?.toDate?.() ?? new Date(),
      lastReviewed: data.lastReviewed?.toDate?.() ?? null,
    } as VocabProgress;
  });
}

/**
 * Update vocabulary progress
 */
export async function updateProgress(
  uid: string,
  vocabId: string,
  progress: Partial<VocabProgress>
): Promise<void> {
  await db
    .collection('users')
    .doc(uid)
    .collection('progress')
    .doc(vocabId)
    .set(progress, { merge: true });
}

/**
 * Batch update progress for multiple cards
 */
export async function batchUpdateProgress(
  uid: string,
  updates: Array<{ vocabId: string; progress: Partial<VocabProgress> }>
): Promise<void> {
  const batch = db.batch();
  
  for (const { vocabId, progress } of updates) {
    const ref = db.collection('users').doc(uid).collection('progress').doc(vocabId);
    batch.set(ref, progress, { merge: true });
  }
  
  await batch.commit();
}

// ============================================
// STATS OPERATIONS
// ============================================

/**
 * Record study session
 */
export async function recordStudySession(
  uid: string,
  session: {
    cardsReviewed: number;
    newCardsLearned: number;
    correctAnswers: number;
    incorrectAnswers: number;
    xpEarned: number;
    goalCompleted: boolean;
    durationMinutes: number;
    startedAt: Date;
  }
): Promise<void> {
  const { startedAt, ...sessionFields } = session;
  const date = new Date().toISOString().split('T')[0];

  await db
    .collection('users')
    .doc(uid)
    .collection('studySessions')
    .add({
      ...sessionFields,
      date,
      startedAt: firestore.Timestamp.fromDate(startedAt),
      endedAt: firestore.FieldValue.serverTimestamp(),
    });
  
  // Update daily stats
  const dailyStatsRef = db
    .collection('users')
    .doc(uid)
    .collection('dailyStats')
    .doc(date);
  
  await dailyStatsRef.set(
    {
      date,
      cardsReviewed: firestore.FieldValue.increment(session.cardsReviewed),
      newCardsLearned: firestore.FieldValue.increment(session.newCardsLearned),
      correctAnswers: firestore.FieldValue.increment(session.correctAnswers),
      totalXpEarned: firestore.FieldValue.increment(session.xpEarned),
      studyTimeMinutes: firestore.FieldValue.increment(session.durationMinutes),
      goalCompleted: session.goalCompleted,
    },
    { merge: true }
  );
  
  // Update user XP
  await db.collection('users').doc(uid).update({
    totalXp: firestore.FieldValue.increment(session.xpEarned),
  });
  
  // Update streak if goal was completed
  if (session.goalCompleted) {
    await updateStreak(uid);
  }
}

/**
 * Check and update user streak
 * Call this when a user completes their daily goal
 */
export async function updateStreak(uid: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  streakMaintained: boolean;
}> {
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    return { currentStreak: 0, longestStreak: 0, streakMaintained: false };
  }
  
  const userData = userDoc.data() as User;
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const lastActiveDate = userData.lastStreakDate || '';
  
  // Calculate yesterday's date
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  let currentStreak = userData.currentStreak || 0;
  let streakMaintained = false;
  
  if (lastActiveDate === today) {
    // Already completed goal today - no change
    streakMaintained = true;
  } else if (lastActiveDate === yesterdayStr) {
    // Completed yesterday - increment streak
    currentStreak += 1;
    streakMaintained = true;
  } else {
    // Streak broken - reset to 1
    currentStreak = 1;
    streakMaintained = false;
  }
  
  const longestStreak = Math.max(currentStreak, userData.longestStreak || 0);
  
  // Update user document
  await userRef.update({
    currentStreak,
    longestStreak,
    lastStreakDate: today,
    lastActiveAt: firestore.FieldValue.serverTimestamp(),
  });
  
  return { currentStreak, longestStreak, streakMaintained };
}

/**
 * Get today's study stats
 */
export async function getTodayStats(uid: string): Promise<{
  cardsReviewed: number;
  newCardsLearned: number;
  correctAnswers: number;
  totalXpEarned: number;
  studyTimeMinutes: number;
  goalCompleted: boolean;
} | null> {
  const today = new Date().toISOString().split('T')[0];
  
  const doc = await db
    .collection('users')
    .doc(uid)
    .collection('dailyStats')
    .doc(today)
    .get();
  
  if (!doc.exists) {
    return {
      cardsReviewed: 0,
      newCardsLearned: 0,
      correctAnswers: 0,
      totalXpEarned: 0,
      studyTimeMinutes: 0,
      goalCompleted: false,
    };
  }
  
  return doc.data() as {
    cardsReviewed: number;
    newCardsLearned: number;
    correctAnswers: number;
    totalXpEarned: number;
    studyTimeMinutes: number;
    goalCompleted: boolean;
  };
}

/**
 * Persist a completed study session: SRS updates + stats + XP in one call.
 * Returns the XP earned so the caller can update local state.
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

  const now = firestore.Timestamp.now();
  const progressUpdates: Array<{ vocabId: string; progress: Partial<VocabProgress> }> = [];

  for (const result of results) {
    const card = cards.find(c => c.vocab.id === result.vocabId);
    if (!card) continue;

    const currentSRS = card.progress ?? DEFAULT_SRS_VALUES;
    const srsUpdate = calculateNextReview(currentSRS, result.quality);

    progressUpdates.push({
      vocabId: result.vocabId,
      progress: {
        vocabId: result.vocabId,
        interval: srsUpdate.interval,
        easeFactor: srsUpdate.easeFactor,
        repetitions: srsUpdate.repetitions,
        nextReview: srsUpdate.nextReview,
        lastReviewed: now.toDate(),
        status: srsUpdate.status,
        // FieldValue.increment is valid inside batch.set+merge; cast needed for TS
        correctCount: firestore.FieldValue.increment(result.correct ? 1 : 0) as unknown as number,
        incorrectCount: firestore.FieldValue.increment(result.correct ? 0 : 1) as unknown as number,
      },
    });
  }

  await Promise.all([
    batchUpdateProgress(uid, progressUpdates),
    recordStudySession(uid, {
      cardsReviewed: totalCards,
      newCardsLearned,
      correctAnswers,
      incorrectAnswers: totalCards - correctAnswers,
      xpEarned,
      goalCompleted: totalCards >= dailyGoal,
      durationMinutes,
      startedAt,
    }),
  ]);

  return { xpEarned };
}

// ============================================
// KANJI OPERATIONS
// ============================================

export async function getKanjiByLevel(level: JlptLevel): Promise<KanjiCard[]> {
  const snapshot = await db
    .collection('kanji')
    .where('jlptLevel', '==', level)
    .orderBy('frequencyRank', 'asc')
    .limit(50)
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KanjiCard));
}

function toDateNative(value: unknown): Date {
  if (value instanceof Date) return value;
  if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  return new Date();
}

function deserializeKanjiProgressNative(id: string, data: Record<string, unknown>): KanjiProgress {
  return {
    kanjiId: id,
    seen: (data.seen as boolean) ?? false,
    correct: (data.correct as number) ?? 0,
    incorrect: (data.incorrect as number) ?? 0,
    lastSeen: data.lastSeen ? toDateNative(data.lastSeen) : null,
    interval: (data.interval as number) ?? 0,
    easeFactor: (data.easeFactor as number) ?? 2.5,
    repetitions: (data.repetitions as number) ?? 0,
    nextReview: data.nextReview ? toDateNative(data.nextReview) : new Date(),
    status: (data.status as KanjiProgress['status']) ?? 'new',
  };
}

export async function getKanjiProgress(userId: string): Promise<Map<string, KanjiProgress>> {
  const snapshot = await db
    .collection('users')
    .doc(userId)
    .collection('kanjiProgress')
    .get();
  const map = new Map<string, KanjiProgress>();
  snapshot.docs.forEach(doc => {
    map.set(doc.id, deserializeKanjiProgressNative(doc.id, doc.data()));
  });
  return map;
}

export async function getDueKanjiCards(userId: string): Promise<KanjiProgress[]> {
  const now = firestore.Timestamp.now();
  const snapshot = await db
    .collection('users')
    .doc(userId)
    .collection('kanjiProgress')
    .where('nextReview', '<=', now)
    .orderBy('nextReview', 'asc')
    .limit(50)
    .get();
  return snapshot.docs.map(doc => deserializeKanjiProgressNative(doc.id, doc.data()));
}

export async function updateKanjiProgress(
  userId: string,
  kanjiId: string,
  data: Partial<Omit<KanjiProgress, 'kanjiId'>>
): Promise<void> {
  const payload: Record<string, unknown> = { kanjiId, ...data, lastSeen: firestore.FieldValue.serverTimestamp() };
  if (data.nextReview instanceof Date) {
    payload.nextReview = firestore.Timestamp.fromDate(data.nextReview);
  }
  await db
    .collection('users')
    .doc(userId)
    .collection('kanjiProgress')
    .doc(kanjiId)
    .set(payload, { merge: true });
}

/**
 * Get weekly stats for last 35 days (5 weeks)
 */
export async function getWeeklyStats(uid: string): Promise<Array<{
  date: string;
  cardsReviewed: number;
  correctAnswers: number;
  xpEarned: number;
}>> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 35);
  
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('dailyStats')
    .where('date', '>=', startDate.toISOString().split('T')[0])
    .where('date', '<=', endDate.toISOString().split('T')[0])
    .orderBy('date', 'asc')
    .get();
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      date: data.date,
      cardsReviewed: data.cardsReviewed || 0,
      correctAnswers: data.correctAnswers || 0,
      xpEarned: data.totalXpEarned || 0,
    };
  });
}

