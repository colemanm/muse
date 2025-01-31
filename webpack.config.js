const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const { DefinePlugin } = webpack;
const path = require('path');
const fs = require('fs');

// Helper to safely load env file
const loadEnvFile = (filepath) => {
  try {
    return require('dotenv').parse(fs.readFileSync(filepath));
  } catch (err) {
    // Return empty object if file doesn't exist
    return {};
  }
};

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Load env files, fallback to empty object if not found
  const prodEnv = loadEnvFile(path.resolve(__dirname, '.env.production'));
  const devEnv = loadEnvFile(path.resolve(__dirname, '.env.development'));
  const defaultEnv = loadEnvFile(path.resolve(__dirname, '.env'));

  // Merge env variables, with Vercel env taking precedence
  const envVariables = {
    ...defaultEnv,
    ...devEnv,
    ...prodEnv,
    ...process.env, // Vercel env variables take precedence
  };

  // Add rule for .md files
  config.module.rules.push({
    test: /\.md$/,
    type: 'asset/source'
  });

  // Copy favicon files
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets/favicon*.{ico,png}', to: '[name][ext]' },
      ],
    })
  );

  // Remove existing plugins
  config.plugins = config.plugins.filter(plugin => 
    plugin.constructor.name !== 'DotenvPlugin' &&
    plugin.constructor.name !== 'DefinePlugin'
  );

  // Add environment variables and __DEV__
  config.plugins.push(
    new DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        EXPO_PUBLIC_FIREBASE_API_KEY: JSON.stringify(envVariables.EXPO_PUBLIC_FIREBASE_API_KEY),
        EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: JSON.stringify(envVariables.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
        EXPO_PUBLIC_FIREBASE_PROJECT_ID: JSON.stringify(envVariables.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
        EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: JSON.stringify(envVariables.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
        EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(envVariables.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
        EXPO_PUBLIC_FIREBASE_APP_ID: JSON.stringify(envVariables.EXPO_PUBLIC_FIREBASE_APP_ID),
      },
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    })
  );

  return config;
}; 