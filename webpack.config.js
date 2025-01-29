const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = async function (env, argv) {
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

  // Add support for environment variables
  config.plugins.push(new Dotenv());

  return config;
}; 