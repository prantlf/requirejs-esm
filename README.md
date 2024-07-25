# ESM to AMD Plugin for RequireJS

[![Latest version](https://img.shields.io/npm/v/requirejs-esm)
 ![Dependency status](https://img.shields.io/librariesio/release/npm/requirejs-esm)
](https://www.npmjs.com/package/requirejs-esm)

A [RequireJS] plugin converting JavaScript modules from ESM to AMD. It takes care only of the module format; it does not transpile the language and that is why it is [a lot faster] than plugins using [Babel]. If you need to transpile the code to an earlier ECMAScript version, have a look at [requirejs-babel7].

The official [RequireJS optimizer] (`r.js`) does not wire up source maps from the original (not transpiled) sources to the source map of the output bundle. It makes this or similar plugins unfeasible for serious work. If you want the proper support for source maps, replace the official optimizer package ([`requirejs`]) with the forked [`@prantlf/requirejs`], which is fixed.

An alternative to this plugin is a preprocessor, which converts the module format before RequireJS consumes it. It is a lot less intrusive solution, but it requires a pluggable development web server, so that a plugin (compatible with [connect middleware]) can be registered in it. See [requirejs-esm-preprocessor] for more information.

## Installation

This module can be installed in your project using [NPM], [PNPM] or [Yarn]. Make sure, that you use [Node.js] version 14 or newer.

```sh
npm i -D requirejs-esm
pnpm i -D requirejs-esm
yarn add requirejs-esm
```

## Usage

Add the following paths to the RequireJS configuration:

```javascript
paths: {
  esm: 'node_modules/requirejs-esm/dist/plugin'
}
```

Reference ESM source files files via the `esm!` plugin prefix:

```javascript
define(['esm!your-esm-module'], function (module) {
  // ...
})
```

You can use the ESM module format in modules loaded by the `esm!` plugin including the keyword `import` for loading nested dependencies. The plugin `esm!` has to be used only in the topmost `require` or `define` statement.

This plugin transpiles only ESM source files. If it detects a statement calling functions `define`, `require` or `require.config` on the root level of the source file, it will return the text of the source file as-is. Source files, which are already AMD modules, are assumed to contain ES5 only.

If you use the RequireJS optimizer `r.js`, you have to bundle the `esm` plugin without the compiling functionality by adding the following to the RequireJS build configuration:

```js
pragmasOnSave: {
  excludeEsm: true // removes the transpiling code from esm.js
}
```

See also a [demo-local] project, which includes sources only from the local `src` directory:

```sh
npm start
open http://localhost:8967/demo-local/normal.html
open http://localhost:8967/demo-local/optimized.html
```

See also a [demo-extern] project, which includes sources from the local `src` directory and from `node_modules` outside of it:

```sh
npm run start
open http://localhost:8967/demo-extern/normal.html
open http://localhost:8967/demo-extern/optimized.html
```

## Advanced

You can customize the [default module name resolution] with the `resolvePath` key (see [resolvePath] for more information) to transpile only modules with a special file extension:

```js
// import * from 'es5module.js'  -> define(['es5module])
// import * from 'es6module.mjs' -> define(['esm!es6module])
fileExtension: '.mjs',
resolvePath: function (sourcePath, currentFile, options, originalResolvePath) {
  // Ignore paths with other plugins applied and the three built-in
  // pseudo-modules of RequireJS.
  if (sourcePath.includes('!') || sourcePath === 'require' ||
      sourcePath === 'module' || sourcePath === 'exports') return

  let lengthWithoutExtension = sourcePath.length - 3
  if (sourcePath.lastIndexOf('.js') === lengthWithoutExtension) {
    return sourcePath.substr(0, lengthWithoutExtension)
  }
  --lengthWithoutExtension
  if (sourcePath.lastIndexOf('.mjs') === lengthWithoutExtension) {
    return 'esm!' + sourcePath.substr(0, lengthWithoutExtension)
  }
}
```

The default implementation of `resolvePath` ensures that every JavaScript dependency will be converted:

```js
function (sourcePath) {
  if (sourcePath.includes('!') || sourcePath === 'require' ||
      sourcePath === 'module' || sourcePath === 'exports') return

  return 'esm!' + sourcePath
}
```

## Options

The `esm` plugin supports configuration with the following defaults:

```js
{
  esm: {
    // Update paths of module dependencies.
    resolvePath: func, // see above
    // Allow using a different plugin alias than `esm` in the source code.
    pluginName: 'esm',
    // The file extension of source files to be transformed.
    fileExtension: '.js',
    // Skip modules already in the AMD format without trying to parse them.
    // Module prefixes like "lib/vendor/" are accepted too. Skipped modules
    // must have all their deep dependencies already transformed.
    skipModules: [],
    // Enforce transpiling even if a optimized module has been loaded.
    mixedAmdAndEsm: false,
    // Suppress transpiling even if an optimized module has not been loaded yet.
    onlyAmd: false,
    // Enable source maps, can be an object with booleans { inline, content }.
    // If set to true, the object will be set to { inline: true, content: true }.
    sourceMap: false,
    // Enable console logging.
    verbose: false,
    // Save a copy of the transformed modules to a directory for debugging purposes.
    debugDir: ''
  }
}
```

## API

The transformation applied by the plugin can be performed programmatically too.

```js
const { transform } = require('requirejs-esm/dist/api')
const { code }  = transform('import a from "a"', 'test', { sourceMap: true })
```

The `transform` method supports a subset of plugin options:

```js
{
  // Update paths of module dependencies.
  resolvePath: func,
  // Allow using a different plugin alias than `esm` in the source code.
  pluginName: 'esm',
  // Enable source maps, can be an object with booleans { inline, content }.
  // If set to true, the object will be set to { inline: true, content: true }.
  sourceMap: false
}
```

The returned object:

```js
{
  // The transpiled module code.
  code: '...',
  // The source map if sourceMap.inline from the options above is false.
  map: undefined | { ... },
  // If the transpilation modified the original source text.
  updated: false | true
}
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Lint and test your code.

## License

Copyright (c) 2022-2024 Ferdinand Prantl

Licensed under the MIT license.

[Babel]: https://babeljs.io/
[RequireJS]: http://requirejs.org
[RequireJS optimizer]: https://requirejs.org/docs/optimization.html
[requirejs-babel7]: https://www.npmjs.com/package/requirejs-babel7
[requirejs-esm-preprocessor]: https://www.npmjs.com/package/requirejs-esm-preprocessor
[connect middleware]: https://github.com/senchalabs/connect/wiki
[`requirejs`]: https://www.npmjs.com/package/requirejs
[`@prantlf/requirejs`]: https://www.npmjs.com/package/@prantlf/requirejs
[Node.js]: http://nodejs.org/
[NPM]: https://www.npmjs.com/
[PNPM]: https://pnpm.io/
[Yarn]: https://yarnpkg.com/
[demo-local]: https://github.com/prantlf/requirejs-esm/tree/master/demo-local
[demo-extern]: https://github.com/prantlf/requirejs-esm/tree/master/demo-extern
[default module name resolution]: https://github.com/prantlf/requirejs-esm/blob/master/src/resolve-path.js#L48
[resolvePath]: https://github.com/tleunen/babel-plugin-module-resolver/blob/master/DOCS.md#resolvepath
[a lot faster]: ./perf/README.md#readme
