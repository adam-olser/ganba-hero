const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const appDirectory = path.resolve(__dirname);
const babelConfig = require('./babel.config.js');

// React Native Web modules that need to be transpiled
const compileNodeModules = [
  'react-native-reanimated',
  'react-native-gesture-handler',
  'react-native-screens',
  'react-native-safe-area-context',
  '@react-navigation',
  'react-native-vector-icons',
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
      process: { env: {} },
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

