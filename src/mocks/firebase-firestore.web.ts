// Mock for @react-native-firebase/firestore on web
// The actual web implementation is in firestore.web.ts
export default () => ({
  collection: () => ({}),
});

export const FirebaseFirestoreTypes = {};

