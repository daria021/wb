const Critters = require('critters-webpack-plugin');

module.exports = function override(config, env) {
  if (env === 'production') {
    // добавляем плагин Critters для извлечения критического CSS
    config.plugins.push(
      new Critters({
        preload: 'swap'
      })
    );
  }
  return config;
};
