[![npm](https://img.shields.io/npm/v/cap-rollup-config.svg)](https://www.npmjs.com/package/cap-rollup-config)
[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)

# cap-rollup-config

A Rollup configurator that provides everything needed for modern web development. It includes legacy bundles for IE11 and a dev server with live reload.

## Install

Using npm:

```console
npm install cap-rollup-config --save-dev
```

## Usage

Create a `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) and import the configurator:

```js
import { getRollupConfig } from 'cap-rollup-config';

export default getRollupConfig();
```

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

Calling `rollup` with the `--watch` flag will start the dev server that will reload any open browser when any bundled file changes.

## Options

### `assetsDir`

Type: `String`<br>
Default: `src/assets`

Path to the directory where the project's assets are stored.

```js
import { getRollupConfig } from 'cap-rollup-config';

export default getRollupConfig({
  assetsDir: 'src/assets'
});
```

### `entryDir`

Type: `String`<br>
Default: `src`

Path to the directory where the project's source is stored.

```js
import { getRollupConfig } from 'cap-rollup-config';

export default getRollupConfig({
  entryDir: 'src'
});
```

### `entryFileName`

Type: `String`<br>
Default: `index`

Name of the JS file that's the entry point for of the project.

```js
import { getRollupConfig } from 'cap-rollup-config';

export default getRollupConfig({
  entryDir: 'index'
});
```

### `outputDir`

Type: `String`<br>
Default: `build`

Path to the directory where the build should be stored. Note that the folder's contents will be deleted when a build is triggered.

```js
import { getRollupConfig } from 'cap-rollup-config';

export default getRollupConfig({
  outputDir: 'build'
});
```

### `outputFileName`

Type: `String`<br>
Default: `index`

Name of the main bundle generated on build. Note that a second bundle will be generated following the format `[outputFileName].legacy.js` to be used in older browsers like IE11.

```js
import { getRollupConfig } from 'cap-rollup-config';

export default getRollupConfig({
  outputFileName: 'index'
});
```

### `host`

Type: `String`<br>
Default: `localhost`

Hostname of the dev server to be used when running rollup with `--watch` flag.

```js
import { getRollupConfig } from 'cap-rollup-config';

export default getRollupConfig({
  host: 'localhost'
});
```

### `port`

Type: `Number`<br>
Default: `4200`

Port of the dev server to be used when running rollup with `--watch` flag.

```js
import { getRollupConfig } from 'cap-rollup-config';

export default getRollupConfig({
  port: 4200
});
```

### `extender`

Type: `Function`<br>
Default: `(pluginConfig) => pluginConfig`

Method that can be used to extend the given configuration for each plugin. It will receive the plugin configuration object as the first parameter and the configuration name as the second parameter.

```js
import { getRollupConfig } from 'cap-rollup-config';

export default getRollupConfig({
  extender: (pluginConfig, configName) => {
    switch(configName) {
      case 'copy':
        return {
          ...pluginConfig,
          // Add some more properties to the configuration object
        };
      case default:
        // Don't forget to always return the plugin config as the
        // method is called for every configuration
        return pluginConfig;
    }
  }
});
```

## Meta

[LICENSE (ISC)](https://opensource.org/licenses/ISC)