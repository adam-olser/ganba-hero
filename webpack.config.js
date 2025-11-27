const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
require('dotenv').config();

const appDirectory = path.resolve(__dirname);

// React Native Web modules that need to be transpiled
const compileNodeModules = [
  'react-native-reanimated',
  'react-native-gesture-handler',
  'react-native-screens',
  'react-native-safe-area-context',
  '@react-navigation',
].map((moduleName) => path.resolve(appDirectory, `node_modules/${moduleName}`));

const babelLoaderConfiguration = {
  test: /\.(js|jsx|ts|tsx)$/,
  include: [
    path.resolve(appDirectory, 'index.web.js'),
    path.resolve(appDirectory, 'src'),
    ...compileNodeModules,
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets: [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
      plugins: [
        'react-native-web',
        '@babel/plugin-transform-runtime',
      ],
    },
  },
};

const svgLoaderConfiguration = {
  test: /\.svg$/,
  use: [
    {
      loader: '@svgr/webpack',
    },
  ],
};

const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png)$/,
  use: {
    loader: 'url-loader',
    options: {
      name: '[name].[ext]',
      esModule: false,
    },
  },
};

module.exports = {
  entry: path.resolve(appDirectory, 'index.web.js'),
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.resolve(appDirectory, 'build'),
    publicPath: '/',
    clean: true,
  },
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js'],
    alias: {
      'react-native$': 'react-native-web',
      // Web-specific implementations
      '@/api/auth': path.resolve(appDirectory, 'src/api/auth.web.ts'),
      '@/api/firestore': path.resolve(appDirectory, 'src/api/firestore.web.ts'),
      // Path aliases
      '@': path.resolve(appDirectory, 'src'),
      '@/api': path.resolve(appDirectory, 'src/api'),
      '@/components': path.resolve(appDirectory, 'src/components'),
      '@/screens': path.resolve(appDirectory, 'src/screens'),
      '@/navigation': path.resolve(appDirectory, 'src/navigation'),
      '@/services': path.resolve(appDirectory, 'src/services'),
      '@/store': path.resolve(appDirectory, 'src/store'),
      '@/hooks': path.resolve(appDirectory, 'src/hooks'),
      '@/types': path.resolve(appDirectory, 'src/types'),
      '@/theme': path.resolve(appDirectory, 'src/theme'),
      '@/utils': path.resolve(appDirectory, 'src/utils'),
      '@/constants': path.resolve(appDirectory, 'src/constants'),
      '@/assets': path.resolve(appDirectory, 'src/assets'),
      '@/i18n': path.resolve(appDirectory, 'src/i18n'),
      '@/config': path.resolve(appDirectory, 'src/config'),
      // Web-specific service implementations
      '@/services/analytics': path.resolve(appDirectory, 'src/services/analytics.web.ts'),
      // Mock native-only modules for web
      '@react-native-firebase/auth': path.resolve(appDirectory, 'src/mocks/firebase-auth.web.ts'),
      '@react-native-firebase/firestore': path.resolve(appDirectory, 'src/mocks/firebase-firestore.web.ts'),
      '@react-native-firebase/app': path.resolve(appDirectory, 'src/mocks/firebase-app.web.ts'),
      '@react-native-firebase/analytics': path.resolve(appDirectory, 'src/mocks/firebase-analytics.web.ts'),
      '@react-native-firebase/crashlytics': path.resolve(appDirectory, 'src/mocks/firebase-crashlytics.web.ts'),
      '@react-native-google-signin/google-signin': path.resolve(appDirectory, 'src/mocks/google-signin.web.ts'),
      '@invertase/react-native-apple-authentication': path.resolve(appDirectory, 'src/mocks/apple-auth.web.ts'),
      '@react-native-async-storage/async-storage': path.resolve(appDirectory, 'src/mocks/async-storage.web.ts'),
      'react-native-svg': path.resolve(appDirectory, 'src/mocks/react-native-svg.web.tsx'),
    },
    fallback: {
      buffer: require.resolve('buffer/'),
    },
  },
  module: {
    rules: [
      babelLoaderConfiguration,
      imageLoaderConfiguration,
      svgLoaderConfiguration,
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(appDirectory, 'web/index.html'),
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      'process.env': JSON.stringify({
        NODE_ENV: process.env.NODE_ENV || 'development',
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
        FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
      }),
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(appDirectory, 'web'),
    },
    historyApiFallback: true,
    hot: true,
    port: 3000,
  },
};
