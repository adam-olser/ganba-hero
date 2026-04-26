// Mock for @react-native-firebase/messaging on web
const messaging = () => ({
  hasPermission: async () => 0,
  requestPermission: async () => 0,
  registerDeviceForRemoteMessages: async () => {},
  getToken: async () => null,
  onMessage: () => () => {},
  setBackgroundMessageHandler: () => {},
});

export default messaging;
