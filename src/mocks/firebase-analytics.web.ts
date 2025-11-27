// Mock for @react-native-firebase/analytics on web
// The actual web implementation is in analytics.web.ts
export default () => ({
  logEvent: async () => {},
  logScreenView: async () => {},
  logAppOpen: async () => {},
  logSignUp: async () => {},
  logLogin: async () => {},
  setUserId: async () => {},
  setUserProperty: async () => {},
  setAnalyticsCollectionEnabled: async () => {},
});

