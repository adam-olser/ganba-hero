// Mock for @react-native-google-signin/google-signin on web
// Web uses Firebase popup sign-in instead
export const GoogleSignin = {
  configure: () => {},
  hasPlayServices: async () => true,
  signIn: async () => ({ idToken: null }),
  signOut: async () => {},
};

export const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
};

