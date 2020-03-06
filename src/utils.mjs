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
export function getSpecifiedOptionsOrDeaults(options) {
  return Object.assign({
    assetsDir: 'src/assets',
    entryDir: 'src',
    entryFileName: 'index',
    outputDir: 'build',
    outputFileName: 'index',
    host: 'localhost',
    port: 4200
  }, options);
}