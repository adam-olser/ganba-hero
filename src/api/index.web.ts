// Web-specific API exports
// Uses Firebase JS SDK instead of React Native Firebase

// Auth API
export {
  signInWithGoogle,
  signInWithApple,
  signInAnonymously,
  linkWithGoogle,
  linkWithApple,
  signOut,
  deleteAccount,
  getCurrentUser,
  onAuthStateChanged,
  isAnonymous,
} from './auth.web';

// Firestore API
export {
  // User operations
  getUser,
  createUser,
  updateUser,
  
  // Vocabulary operations
  getVocabByLevel,
  getVocabByIds,
  searchVocab,
  
  // Grammar operations
  getGrammarByLevel,
  getGrammarById,
  
  // Progress operations
  getProgress,
  getDueCards,
  updateProgress,
  
  // Stats operations
  recordStudySession,
  getDailyStats,
  updateStreak,
} from './firestore.web';

