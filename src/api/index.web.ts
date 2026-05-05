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
  updateUserSettings,
  
  // Vocabulary operations
  getVocabByLevel,
  getVocabById,
  getVocabByIds,
  searchVocab,
  
  // Grammar operations
  getGrammarByLevel,
  getGrammarById,

  // Kanji operations
  getKanjiByLevel,
  getKanjiProgress,
  getDueKanjiCards,
  updateKanjiProgress,
  
  // Progress operations
  getProgress,
  getUserProgress,
  getDueCards,
  updateProgress,
  
  // Stats operations
  recordStudySession,
  saveSessionResults,
  saveKanjiSessionResults,
  getTodayStats,
  getDailyStats,
  getWeeklyStats,
  updateStreak,
} from './firestore.web';

