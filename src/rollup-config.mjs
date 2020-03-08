import path from 'path';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import filesize from 'rollup-plugin-filesize';
import cleaner from 'rollup-plugin-cleaner';
import copy from 'rollup-plugin-copy';
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser';
import { entryCodeInjector } from 'rollup-plugin-entry-code-injector';
import { getPluginConfig } from './plugins-config';
import { getSpecifiedOptionsOrDeaults } from './utils' ;

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
export function getRollupConfig(options) {
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
      ]
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
export function getBaseRollupConfig(options) {
  const parsedOptions = getSpecifiedOptionsOrDeaults(options);
  const { entryDir, entryFileName, outputDir, outputFileName } = parsedOptions;
  return [{
    input: path.join(entryDir, `${entryFileName}.js`),
    output: {
      file: path.join(outputDir, `${outputFileName}.js`),
      format: 'esm',
    },
    plugins: [
      copy(getPluginConfig('copy', parsedOptions)),
      resolve(),
      babel(getPluginConfig('babel', parsedOptions))
    ]
  }, {
    input: path.join(entryDir, `${entryFileName}.js`),
    output: {
      file: path.join(outputDir, `${outputFileName}.legacy.js`),
      format: 'esm',
    },
    plugins: [
      entryCodeInjector(getPluginConfig('entryCodeInjector', parsedOptions)),
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
export function getServerPlugins(options) {
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
export function getBuildPlugins(options) {
  const parsedOptions = getSpecifiedOptionsOrDeaults(options);
  return [
    terser(getPluginConfig('terser', parsedOptions)),
    filesize('filesize', parsedOptions)
  ];
}

/**
 * @private
 */
function isWatchMode() {
  return Boolean(process.env.ROLLUP_WATCH);
}
