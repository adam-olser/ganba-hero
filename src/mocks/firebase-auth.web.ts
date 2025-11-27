// Mock for @react-native-firebase/auth on web
// The actual web implementation is in auth.web.ts
export default () => ({
  currentUser: null,
  signInAnonymously: async () => ({ user: null }),
  signInWithCredential: async () => ({ user: null }),
  signOut: async () => {},
  onAuthStateChanged: () => () => {},
});

export const FirebaseAuthTypes = {};

