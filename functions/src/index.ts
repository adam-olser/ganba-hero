/**
 * Ganba Hero - Firebase Cloud Functions
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

/**
 * Create user document when a new user signs up
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;
  
  const userData = {
    uid,
    email: email || null,
    displayName: displayName || null,
    avatarUrl: photoURL || null,
    isAnonymous: user.providerData.length === 0,
    currentLevel: 'N5',
    subscriptionStatus: 'free',
    subscriptionExpiry: null,
    totalXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastStreakDate: null,
    level: 1,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
    settings: {
      dailyNewCards: 5,
      dailyReviewLimit: 100,
      showFurigana: true,
      ttsEnabled: true,
      ttsSpeed: 1.0,
      soundEnabled: true,
      preferredMode: 'both',
      notificationsEnabled: true,
      reminderTime: '09:00',
      enhancedAnalyticsEnabled: false,
    },
  };
  
  await db.collection('users').doc(uid).set(userData);
  
  functions.logger.info(`Created user document for ${uid}`);
});

/**
 * Clean up user data when account is deleted
 */
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  const { uid } = user;
  
  // Delete user document and subcollections
  const userRef = db.collection('users').doc(uid);
  
  // Delete subcollections
  const subcollections = ['progress', 'grammarProgress', 'studySessions', 'dailyStats'];
  
  for (const subcollection of subcollections) {
    const snapshot = await userRef.collection(subcollection).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
  
  // Delete user document
  await userRef.delete();
  
  functions.logger.info(`Deleted user data for ${uid}`);
});

/**
 * Update user's last active timestamp
 */
export const updateLastActive = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { uid } = context.auth;
  
  await db.collection('users').doc(uid).update({
    lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return { success: true };
});

/**
 * Calculate and update user's streak
 */
export const updateStreak = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { uid } = context.auth;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }
  
  const userData = userDoc.data()!;
  const lastStreakDate = userData.lastStreakDate;
  let currentStreak = userData.currentStreak || 0;
  let longestStreak = userData.longestStreak || 0;
  
  if (lastStreakDate === today) {
    // Already updated today
    return { currentStreak, longestStreak };
  }
  
  // Calculate yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (lastStreakDate === yesterdayStr) {
    // Streak continues
    currentStreak += 1;
  } else {
    // Streak broken, start new
    currentStreak = 1;
  }
  
  // Update longest streak if necessary
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }
  
  await userRef.update({
    currentStreak,
    longestStreak,
    lastStreakDate: today,
  });
  
  return { currentStreak, longestStreak };
});

/**
 * Get user's due cards count
 */
export const getDueCardsCount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { uid } = context.auth;
  const now = admin.firestore.Timestamp.now();
  
  const progressSnapshot = await db
    .collection('users')
    .doc(uid)
    .collection('progress')
    .where('nextReview', '<=', now)
    .count()
    .get();
  
  return { dueCount: progressSnapshot.data().count };
});

