'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = _interopDefault(require('path'));
var resolve = _interopDefault(require('rollup-plugin-node-resolve'));
var babel = _interopDefault(require('rollup-plugin-babel'));
var filesize = _interopDefault(require('rollup-plugin-filesize'));
var cleaner = _interopDefault(require('rollup-plugin-cleaner'));
var copy = _interopDefault(require('rollup-plugin-copy'));
var serve = _interopDefault(require('rollup-plugin-serve'));
var livereload = _interopDefault(require('rollup-plugin-livereload'));
var rollupPluginTerser = require('rollup-plugin-terser');
var rollupPluginEntryCodeInjector = require('rollup-plugin-entry-code-injector');
var nodeHtmlParser = require('node-html-parser');
var terser = require('terser');

/**
 * @typedef Options
 * @type {Object}
 * @property {string} assetsDir - Assets directory. Defaults to 'src/assets'
 * @property {string} entryDir - Entry directory default to 'src'
 * @property {string} entryFileName - Entry file name without extension. Defaults to 'index'
 * @property {string} outputDir - Output directory. Defaults to 'build'
 * @property {string} outputFileName - Output file name without extension. Defaults to 'index'
 * @property {string} host - Hostname of for the dev server. Defaults to 'localhost'
 * @property {number} port - Port on which to start the dev server. Defaults to 4200
 */

/**
 * Returns the parsed options with defaults for unspecified properties
 * @param options {Options} - Options to be applied to the generated Rollup configuration
 * @return {Options} - Parsed options
 */
function getSpecifiedOptionsOrDeaults(options) {
  return Object.assign({
    assetsDir: 'src/assets',
    entryDir: 'src',
    entryFileName: 'index',
    outputDir: 'build',
    outputFileName: 'index',
    host: 'localhost',
    port: 4200,
    extender: (pluginConfig) => pluginConfig
  }, options);
}

/**
 * @typedef Options
 * @type {Object}
 * @property {string} assetsDir - Assets directory. Defaults to 'src/assets'
 * @property {string} entryDir - Entry directory default to 'src'
 * @property {string} entryFileName - Entry file name without extension. Defaults to 'index'
 * @property {string} outputDir - Output directory. Defaults to 'build'
 * @property {string} outputFileName - Output file name without extension. Defaults to 'index'
 * @property {string} host - Hostname of for the dev server. Defaults to 'localhost'
 * @property {number} port - Port on which to start the dev server. Defaults to 4200
 */

/**
 * Returns the configuration for the selected plugin applying the options
 * @param pluginConfigName {string} - Configuration name to be retireved
 * @param options {Options} - Options to be applied to the generated Rollup configuration
 * @return {Object} - Rollup plugin configuration
 */
function getPluginConfig(pluginConfigName, options) {
  const pluginConfigsMap = {
    babel: getBabelConfig,
    babelLegacy: getBabelLegacyConfig,
    copy: getCopyConfig,
    terser: getTerserConfig,
    cleaner: getCleanerConfig,
    entryCodeInjector: getEntryCodeInjectorConfig,
    serve: getServeConfig,
    livereload: getLivereloadConfig
  };
  const parsedOptions = getSpecifiedOptionsOrDeaults(options);
  const pluginConfig = pluginConfigsMap[pluginConfigName](parsedOptions) || {};
  const { extender } = parsedOptions;
  return extender(pluginConfig, pluginConfigName);
}
/**
 * @private
 */
function getBabelConfig() {
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: false,
          modules: false,
          targets: {
            chrome: '61',
            firefox: '60',
            edge: '16',
            safari: '11',
            opera: '48'
          },
        }
      ]
    ]
  }
}
/**
 * @private
 */
function getBabelLegacyConfig() {
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: false,
          modules: false,
          targets: {
            browsers: '> 1%, IE 11, not dead',
          },
        }
      ]
    ]
  };
}
/**
 * @private
 */
function getTerserConfig() {
  return {
    output: {
      comments: false
    }
  };
}
/**
 * @private
 */
function getCleanerConfig(options) {
  const { outputDir } = options;
  return {
    targets: [ outputDir ]
  };
}
/**
 * @private
 */
function getEntryCodeInjectorConfig() {
  return {
    prepend: `import 'regenerator-runtime/runtime';`
  };
}
/**
 * @private
 */
function injectScripts(options, codeBuffer) {
  const { outputFileName } = options;
  const $html = nodeHtmlParser.parse(codeBuffer.toString());
  const $body = $html.querySelector('body');
  $body.insertAdjacentHTML('beforeend', `
    <script src="./webcomponents-loader.js"></script>
    <script defer src='./${outputFileName}.js' type="module"></script>
    <script defer data-main='./${outputFileName}.legacy.js' src="./require.js" nomodule></script>
  `);
  $html.removeWhitespace();
  return '<!DOCTYPE html>' + $html.toString();
}

/**
 * @private
 */
function minifyScript(codeBuffer) {
  return terser.minify(codeBuffer.toString()).code;
}

/**
 * @private
 */
function getCopyConfig(options) {
  const { entryDir, outputDir, assetsDir } = options;
  return {
    targets: [{
      src: path.join(entryDir, 'index.html'),
      transform: injectScripts.bind(this, options),
      dest: outputDir
    }, {
      src: assetsDir,
      dest: outputDir,
      copyOnce: true
    }, {
      src: 'node_modules/@webcomponents/webcomponentsjs/bundles/*.js',
      dest: `${outputDir}/bundles`,
      transform: minifyScript,
      copyOnce: true
    }, {
      src: [
        'node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js',
        'node_modules/requirejs/require.js'
      ],
      dest: outputDir,
      transform: minifyScript,
      copyOnce: true
    }]
  };
}
/**
 * @private
 */
function getServeConfig(options) {
  const { outputDir, host, port } = options;
  return {
    contentBase: outputDir,
    historyApiFallback: true,
    host,
    port
  };
}
/**
 * @private
 */
function getLivereloadConfig(options) {
  const { outputDir } = options;
  return {
    watch: outputDir
  };
}

/**
 * @typedef Options
 * @type {Object}
 * @property {string} assetsDir - Assets directory. Defaults to 'src/assets'
 * @property {string} entryDir - Entry directory default to 'src'
 * @property {string} entryFileName - Entry file name without extension. Defaults to 'index'
 * @property {string} outputDir - Output directory. Defaults to 'build'
 * @property {string} outputFileName - Output file name without extension. Defaults to 'index'
 * @property {string} host - Hostname of for the dev server. Defaults to 'localhost'
 * @property {number} port - Port on which to start the dev server. Defaults to 4200
 */

/**
 * Returns a configuration for Rollup that includes everything necessary
 * to generate JS bundles for mordern and legacy browsers.
 * Additionally, it provides a development server when Rollup is called with the
 * -w (--watch) flag
 * @param options {Options} - Options to be applied to the generated Rollup configuration
 * @return {Array} - Rollup configuration
 */
function getRollupConfig(options) {
  const parsedOptions = getSpecifiedOptionsOrDeaults(options);
  const rollupConfig = getBaseRollupConfig(parsedOptions);
  if (isWatchMode()) {
    rollupConfig[0].plugins = [
      ...rollupConfig[0].plugins,
      ...getServerPlugins(parsedOptions)
    ];
  } else {
    rollupConfig.forEach((config) => {
      config.plugins = [
        ...config.plugins,
        ...getBuildPlugins(parsedOptions)
      ];
    });
    rollupConfig[0].plugins.unshift(
      cleaner(getPluginConfig('cleaner', parsedOptions))
    );
  }
  return rollupConfig;
}

/**
 * Returns a configuration for Rollup that includes everything necessary
 * to generate JS bundles for mordern and legacy browsers.
 * @param options {Options} - Options to be applied to the generated Rollup configuration
 * @return {Array} - Rollup configuration
 */
function getBaseRollupConfig(options) {
  const parsedOptions = getSpecifiedOptionsOrDeaults(options);
  const { entryDir, entryFileName, outputDir, outputFileName } = parsedOptions;
  return [{
    input: path.join(entryDir, `${entryFileName}.js`),
    output: {
      dir: outputDir,
      format: 'esm',
      chunkFileNames: '[name].[hash].js',
      entryFileNames: `${outputFileName}.js`
    },
    plugins: [
      copy(getPluginConfig('copy', parsedOptions)),
      resolve(),
      babel(getPluginConfig('babel', parsedOptions))
    ]
  }, {
    input: path.join(entryDir, `${entryFileName}.js`),
    output: {
      dir: outputDir,
      format: 'amd',
      chunkFileNames: '[name].[hash].legacy.js',
      entryFileNames: `${outputFileName}.legacy.js`
    },
    plugins: [
      rollupPluginEntryCodeInjector.entryCodeInjector(getPluginConfig('entryCodeInjector', parsedOptions)),
      resolve(),
      babel(getPluginConfig('babelLegacy', parsedOptions))
    ]
  }];
}

/**
 * Returns a plugin configuration for Rollup that includes a live reload dev server
 * @param options {Options} - Options to be applied to the generated Rollup configuration
 * @return {Array} - Rollup configuration
 */
function getServerPlugins(options) {
  const parsedOptions = getSpecifiedOptionsOrDeaults(options);
  return [
    serve(getPluginConfig('serve', parsedOptions)),
    livereload(getPluginConfig('livereload', parsedOptions))
  ];
}

/**
 * Returns a plugin configuration for Rollup that includes minification and file size display
 * @param options {Options} - Options to be applied to the generated Rollup configuration
 * @return {Array} - Rollup configuration
 */
function getBuildPlugins(options) {
  const parsedOptions = getSpecifiedOptionsOrDeaults(options);
  return [
    rollupPluginTerser.terser(getPluginConfig('terser', parsedOptions)),
    filesize('filesize', parsedOptions)
  ];
}

/**
 * @private
 */
function isWatchMode() {
  return Boolean(process.env.ROLLUP_WATCH);
}

exports.getBaseRollupConfig = getBaseRollupConfig;
exports.getBuildPlugins = getBuildPlugins;
exports.getRollupConfig = getRollupConfig;
exports.getServerPlugins = getServerPlugins;
