import { parse } from 'node-html-parser';
import { minify } from 'terser';
import { getSpecifiedOptionsOrDeaults } from './utils' ;

/**
 * Returns the configuration for the selected plugin applying the options
 * @param pluginConfigName {string} - Configuration name to be retireved
 * @param options {Options} - Options to be applied to the generated Rollup configuration
 * @return {Object} - Rollup plugin configuration
 */
export function getPluginConfig(pluginConfigName, options) {
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
};

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
};

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
};

/**
 * @private
 */
function getTerserConfig() {
  return {
    output: {
      comments: false
    }
  };
};

/**
 * @private
 */
function getCleanerConfig(options) {
  const { outputDir } = options;
  return {
    targets: [ outputDir ]
  };
};

/**
 * @private
 */
function getEntryCodeInjectorConfig() {
  return {
    prepend: `import 'regenerator-runtime/runtime';`
  };
};

/**
 * @private
 */
function injectScripts(options, codeBuffer) {
  const { outputFileName } = options;
  const $html = parse(codeBuffer.toString());
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
  return minify(codeBuffer.toString()).code;
}

/**
 * @private
 */
function getCopyConfig(options) {
  const { entryDir, outputDir, assetsDir } = options;
  return {
    targets: [{
      src: `${entryDir}/index.html`,
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
};

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
};

/**
 * @private
 */
function getLivereloadConfig(options) {
  const { outputDir } = options;
  return {
    watch: outputDir
  };
};
