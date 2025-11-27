/**
 * Authentication API - Web Version
 * 
 * Uses Firebase JS SDK for web platform.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider,
  signInWithPopup, 
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  deleteUser,
  linkWithPopup,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { firebaseConfig } from '@/config/firebase';

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);

// Providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign in with Apple
 */
export async function signInWithApple(): Promise<FirebaseUser> {
  appleProvider.addScope('email');
  appleProvider.addScope('name');
  const result = await signInWithPopup(auth, appleProvider);
  return result.user;
}

/**
 * Sign in anonymously (guest mode)
 */
export async function signInAnonymously(): Promise<FirebaseUser> {
  const result = await firebaseSignInAnonymously(auth);
  return result.user;
}

/**
 * Link anonymous account to Google
 */
export async function linkWithGoogle(): Promise<FirebaseUser> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No user signed in');
  }
  
  const result = await linkWithPopup(currentUser, googleProvider);
  return result.user;
}

/**
 * Link anonymous account to Apple
 */
export async function linkWithApple(): Promise<FirebaseUser> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No user signed in');
  }
  
  appleProvider.addScope('email');
  appleProvider.addScope('name');
  const result = await linkWithPopup(currentUser, appleProvider);
  return result.user;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Delete the current user's account
 */
export async function deleteAccount(): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No user signed in');
  }
  
  await deleteUser(currentUser);
}

/**
 * Get the current user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChanged(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * Check if user is anonymous
 */
export function isAnonymous(): boolean {
  return auth.currentUser?.isAnonymous ?? false;
}

