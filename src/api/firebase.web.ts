/**
 * Firebase Web SDK Initialization
 * 
 * This file initializes Firebase for web platform using the JS SDK.
 * For native platforms, @react-native-firebase is used instead.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signInAnonymously as firebaseSignInAnonymously,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  linkWithPopup,
  deleteUser,
  User,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import { firebaseConfig } from '@/config/firebase';

// Initialize Firebase App (only once)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  }
  
  return { app, auth, db };
}

// Initialize on import
const firebase = initializeFirebase();

// Export initialized instances
export { firebase, auth, db };

// Auth providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

/**
 * Sign in with Google (Web)
 */
export async function signInWithGoogleWeb(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign in with Apple (Web)
 */
export async function signInWithAppleWeb(): Promise<User> {
  appleProvider.addScope('email');
  appleProvider.addScope('name');
  const result = await signInWithPopup(auth, appleProvider);
  return result.user;
}

/**
 * Sign in anonymously (Web)
 */
export async function signInAnonymouslyWeb(): Promise<User> {
  const result = await firebaseSignInAnonymously(auth);
  return result.user;
}

/**
 * Sign out (Web)
 */
export async function signOutWeb(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Listen to auth state changes (Web)
 */
export function onAuthStateChangedWeb(
  callback: (user: User | null) => void
): () => void {
  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * Link anonymous account with Google (Web)
 */
export async function linkWithGoogleWeb(): Promise<User> {
  const user = auth.currentUser;
  if (!user) throw new Error('No user signed in');
  const result = await linkWithPopup(user, googleProvider);
  return result.user;
}

/**
 * Link anonymous account with Apple (Web)
 */
export async function linkWithAppleWeb(): Promise<User> {
  const user = auth.currentUser;
  if (!user) throw new Error('No user signed in');
  appleProvider.addScope('email');
  appleProvider.addScope('name');
  const result = await linkWithPopup(user, appleProvider);
  return result.user;
}

/**
 * Delete current user account (Web)
 */
export async function deleteAccountWeb(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No user signed in');
  await deleteUser(user);
}

/**
 * Get current user (Web)
 */
export function getCurrentUserWeb(): User | null {
  return auth.currentUser;
}

/**
 * Check if current user is anonymous (Web)
 */
export function isAnonymousWeb(): boolean {
  return auth.currentUser?.isAnonymous ?? false;
}

// Firestore helpers
export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
};

export type { User, Firestore };

