module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@/api': './src/api',
          '@/components': './src/components',
          '@/screens': './src/screens',
          '@/navigation': './src/navigation',
          '@/services': './src/services',
          '@/store': './src/store',
          '@/hooks': './src/hooks',
          '@/types': './src/types',
          '@/theme': './src/theme',
          '@/utils': './src/utils',
          '@/constants': './src/constants',
          '@/assets': './src/assets',
          '@/i18n': './src/i18n',
        },
      },
    ],
  ],
};

