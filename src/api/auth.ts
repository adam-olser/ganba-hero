/**
 * Authentication API
 * 
 * Handles Firebase authentication operations.
 */

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { Platform } from 'react-native';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
});

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<FirebaseAuthTypes.User> {
  // Get the users ID token
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const { idToken } = await GoogleSignin.signIn();
  
  // Create a Google credential with the token
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  
  // Sign-in the user with the credential
  const userCredential = await auth().signInWithCredential(googleCredential);
  
  return userCredential.user;
}

/**
 * Sign in with Apple
 */
export async function signInWithApple(): Promise<FirebaseAuthTypes.User> {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Sign-In is only available on iOS');
  }
  
  // Start the sign-in request
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });
  
  // Ensure we have an identityToken
  if (!appleAuthRequestResponse.identityToken) {
    throw new Error('Apple Sign-In failed - no identify token returned');
  }
  
  // Create a Firebase credential from the response
  const { identityToken, nonce } = appleAuthRequestResponse;
  const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
  
  // Sign the user in with the credential
  const userCredential = await auth().signInWithCredential(appleCredential);
  
  return userCredential.user;
}

/**
 * Sign in anonymously (guest mode)
 */
export async function signInAnonymously(): Promise<FirebaseAuthTypes.User> {
  const userCredential = await auth().signInAnonymously();
  return userCredential.user;
}

/**
 * Link anonymous account to Google
 */
export async function linkWithGoogle(): Promise<FirebaseAuthTypes.User> {
  const currentUser = auth().currentUser;
  if (!currentUser) {
    throw new Error('No user signed in');
  }
  
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const { idToken } = await GoogleSignin.signIn();
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  
  const userCredential = await currentUser.linkWithCredential(googleCredential);
  return userCredential.user;
}

/**
 * Link anonymous account to Apple
 */
export async function linkWithApple(): Promise<FirebaseAuthTypes.User> {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Sign-In is only available on iOS');
  }
  
  const currentUser = auth().currentUser;
  if (!currentUser) {
    throw new Error('No user signed in');
  }
  
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });
  
  if (!appleAuthRequestResponse.identityToken) {
    throw new Error('Apple Sign-In failed - no identify token returned');
  }
  
  const { identityToken, nonce } = appleAuthRequestResponse;
  const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
  
  const userCredential = await currentUser.linkWithCredential(appleCredential);
  return userCredential.user;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  // Sign out from Google if signed in with Google
  try {
    await GoogleSignin.signOut();
  } catch {
    // Ignore if not signed in with Google
  }
  
  await auth().signOut();
}

/**
 * Delete the current user's account
 */
export async function deleteAccount(): Promise<void> {
  const currentUser = auth().currentUser;
  if (!currentUser) {
    throw new Error('No user signed in');
  }
  
  await currentUser.delete();
}

/**
 * Get the current user
 */
export function getCurrentUser(): FirebaseAuthTypes.User | null {
  return auth().currentUser;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChanged(
  callback: (user: FirebaseAuthTypes.User | null) => void
): () => void {
  return auth().onAuthStateChanged(callback);
}

/**
 * Check if user is anonymous
 */
export function isAnonymous(): boolean {
  return auth().currentUser?.isAnonymous ?? false;
}

