/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const path = require('path');
const dotenv = require('dotenv');

function generateTheme() {
  let variableLoad = `
      @import "~bootstrap/scss/_functions.scss";
      @import "~bootstrap/scss/_mixins.scss";
      @import "~@forgerock/platform-shared/src/scss/theme-variables.scss";
    `;

  if (process.env.THEME && process.env.THEME !== 'default') {
    variableLoad += `@import "~@forgerock/platform-shared/src/scss/${process.env.THEME}-theme.scss"; `;
  }

  variableLoad += '@import "~bootstrap/scss/_variables.scss";';

  return variableLoad;
}

const SUBFOLDER = './';
module.exports = {
  publicPath: SUBFOLDER,
  runtimeCompiler: true,
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      if (SUBFOLDER !== './') {
        devServer.app.get(SUBFOLDER.replace(/\/$/, '$'), (req, res) => {
          res.redirect(SUBFOLDER);
        });
      } else {
        devServer.app.all((req, res, next) => {
          next();
        });
      }
      return middlewares;
    },
    allowedHosts: 'all',
    host: process.env.HOST || '0.0.0.0',
    port: process.env.DEV_PORT || 8083,
    client: {
      webSocketURL: {
        hostname: 'localhost',
        pathname: 'ws',
        port: process.env.DEV_PORT || 8083,
      },
    },
    webSocketServer: process.env.NODE_ENV !== 'development' ? false : 'ws',
    compress: false,
    historyApiFallback: true,
  },
  chainWebpack: (config) => {
    config.module
      .rule('js')
      .use('babel-loader')
      .tap((options) => ({
        ...options,
        rootMode: 'upward',
      }));

    /**
     * Regenerates the environment variables using the define plugin of webpack in non-development environments
     *   - before building load the environment variables from .env file using dotenv module
     *   - format those variables to fit the string format required by define plugin
     *   - overwrites the formated variables to the webpack definitions
     * This is required due to an error replacing environment variables on the final bundle where they are replaced by empty values
     */
    if (process.env.NODE_ENV !== 'development') {
      config
        .plugin('define')
        .tap((definitions) => {
          const envs = dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
          const envsFormatted = Object.entries(envs.parsed).reduce((newEnvs, [key, value]) => {
            newEnvs[key] = JSON.stringify(value);
            return newEnvs;
          }, {});
          definitions[0]['process.env'] = {
            ...definitions[0]['process.env'],
            ...envsFormatted,
          };
          return definitions;
        });
    }
  },
  configureWebpack: {
    devtool: process.env.NODE_ENV === 'development' ? 'eval-source-map' : 'source-map',
    output: {
      devtoolModuleFilenameTemplate: (info) => {
        const resPath = path.normalize(info.resourcePath);
        const isVue = resPath.match(/\.vue$/);
        const isGenerated = info.allLoaders;

        const generated = `webpack-generated:///${resPath}?${info.hash}`;
        const vuesource = `vue-source:///${resPath}`;

        return isVue && isGenerated ? generated : vuesource;
      },
      devtoolFallbackModuleFilenameTemplate: 'webpack:///[resource-path]?[hash]',
    },
  },
  css: {
    loaderOptions: {
      css: {
        modules: {
          auto: () => true,
          mode: 'global',
        },
      },
      sass: {
        prependData: generateTheme(),
      },
    },
  },
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false,
    },
    lintStyleOnBuild: true,
  },
  transpileDependencies: [
    'postcss',
    'nanoid',
    'sanitize-html',
  ],
};
