const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const { DefinePlugin } = webpack;
const path = require('path');
const fs = require('fs');

module.exports = async function (env, argv) {
  // Determine which env file to use
  const envPath = process.env.NODE_ENV === 'production' 
    ? path.resolve(__dirname, '.env.production')
    : path.resolve(__dirname, '.env.development');

  // Read the appropriate .env file
  const envVars = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .reduce((vars, line) => {
      const [key, value] = line.split('=');
      vars[key] = value.replace(/["']/g, '');
      return vars;
    }, {});

  const config = await createExpoWebpackConfigAsync({
    ...env,
    template: './web/index.html',
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@expo/webpack-config/web-default/index.html'],
    },
  }, argv);

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
        EXPO_PUBLIC_FIREBASE_API_KEY: JSON.stringify(envVars.EXPO_PUBLIC_FIREBASE_API_KEY),
        EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: JSON.stringify(envVars.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
        EXPO_PUBLIC_FIREBASE_PROJECT_ID: JSON.stringify(envVars.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
        EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: JSON.stringify(envVars.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
        EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(envVars.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
        EXPO_PUBLIC_FIREBASE_APP_ID: JSON.stringify(envVars.EXPO_PUBLIC_FIREBASE_APP_ID),
      },
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    })
  );

  return config;
}; 