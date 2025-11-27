// Mock for @react-native-firebase/crashlytics on web
// Web doesn't have native crashlytics, errors go to console
export default () => ({
  log: () => {},
  recordError: () => {},
  setUserId: async () => {},
  setAttribute: async () => {},
  setAttributes: async () => {},
  setCrashlyticsCollectionEnabled: async () => {},
});

