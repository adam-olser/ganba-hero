// Mock for @invertase/react-native-apple-authentication on web
// Web uses Firebase popup sign-in instead
export const appleAuth = {
  isSupported: false,
  Operation: {
    LOGIN: 'LOGIN',
  },
  Scope: {
    EMAIL: 'email',
    FULL_NAME: 'fullName',
  },
  performRequest: async () => ({
    identityToken: null,
    nonce: null,
  }),
};

export const AppleButton = () => null;

