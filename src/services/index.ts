// Spaced Repetition System
export {
  calculateNextReview,
  isCardDue,
  daysUntilReview,
  getCardPriority,
  sortByPriority,
  DEFAULT_SRS_VALUES,
  type Quality,
  type SRSUpdate,
} from './srs';

// Input Normalizer
export {
  normalizeInput,
  normalizeJapanese,
  stringsMatch,
  isAnswerCorrect,
  isReadingCorrect,
  calculateSimilarity,
  isAlmostCorrect,
  getInputType,
  checkAnswer,
} from './inputNormalizer';

// XP Calculator
export {
  calculateXpEarned,
  calculateXpWithQuality,
  calculateLevel,
  getLevelProgress,
  xpForLevel,
  getLevelTitle,
  calculateStreakBonus,
  calculateSessionXp,
  calculateAccuracy,
  XP_PER_LEVEL,
  MAX_LEVEL,
} from './xpCalculator';

// Card Queue
export {
  buildStudyQueue,
  getQueueCounts,
  isDailyGoalReached,
  cardsUntilGoal,
  shuffleArray,
  DEFAULT_QUEUE_OPTIONS,
  type QueueOptions,
} from './cardQueue';

// Analytics
export { analyticsService, AnalyticsService } from './analytics';

// Text-to-Speech
export {
  isTTSAvailable,
  speakJapanese,
  stopSpeaking,
  preloadVoices,
  getJapaneseVoices,
} from './tts';

// Notifications
export {
  isNotificationsSupported,
  getNotificationPermission,
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
  showLocalNotification,
  parseTimeString,
  formatTimeString,
  type NotificationPermission,
} from './notifications';

// Sound Effects
export {
  soundsService,
  playSound,
  setSoundEnabled,
  type SoundEffect,
} from './sounds';

