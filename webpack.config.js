const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@expo/webpack-config/web-default/index.html'],
    },
  }, argv);

  // Add rule for .md files
  config.module.rules.push({
    test: /\.md$/,
    type: 'asset/source'
  });

  return config;
}; 