/**
 * Firestore API
 * 
 * Database operations for users, vocabulary, and progress.
 */

import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import type { User, Vocabulary, GrammarPoint, VocabProgress, JlptLevel } from '@/types';

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
 * Get user's vocabulary progress
 */
export async function getUserProgress(uid: string): Promise<Map<string, VocabProgress>> {
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('progress')
    .get();
  
  const progressMap = new Map<string, VocabProgress>();
  snapshot.docs.forEach(doc => {
    progressMap.set(doc.id, { vocabId: doc.id, ...doc.data() } as VocabProgress);
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
  
  return snapshot.docs.map(doc => ({ vocabId: doc.id, ...doc.data() } as VocabProgress));
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
  }
): Promise<void> {
  const date = new Date().toISOString().split('T')[0];
  
  await db
    .collection('users')
    .doc(uid)
    .collection('studySessions')
    .add({
      ...session,
      date,
      startedAt: firestore.FieldValue.serverTimestamp(),
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

