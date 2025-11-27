/**
 * Firebase Configuration
 * 
 * Initialize Firebase for web and native platforms.
 * Web uses the JS SDK, native uses @react-native-firebase.
 */

import { Platform } from 'react-native';

// Firebase config from environment or hardcoded for development
// In production, these should come from environment variables
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: process.env.FIREBASE_APP_ID || 'YOUR_APP_ID',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || undefined,
};

/**
 * Check if Firebase is configured
 */
export function isFirebaseConfigured(): boolean {
  return (
    firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
    firebaseConfig.projectId !== 'YOUR_PROJECT_ID'
  );
}

/**
 * Get platform-specific Firebase initialization info
 */
export function getFirebaseInfo() {
  return {
    platform: Platform.OS,
    configured: isFirebaseConfigured(),
    projectId: firebaseConfig.projectId,
  };
}

export default firebaseConfig;

