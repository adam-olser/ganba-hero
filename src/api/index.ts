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
} from './auth';

// Firestore API
export {
  // User operations
  getUser,
  createUser,
  updateUser,
  updateUserSettings,
  subscribeToUser,
  
  // Vocabulary operations
  getVocabByLevel,
  getVocabById,
  getVocabByIds,
  
  // Grammar operations
  getGrammarByLevel,
  getGrammarById,
  
  // Progress operations
  getUserProgress,
  getDueCards,
  updateProgress,
  batchUpdateProgress,
  
  // Stats operations
  recordStudySession,
  getTodayStats,
  updateStreak,
  getWeeklyStats,
} from './firestore';

