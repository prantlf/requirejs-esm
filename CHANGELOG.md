# Changes

## [4.2.0](https://github.com/prantlf/requirejs-esm/compare/v4.1.0...v4.2.0) (2025-12-07)

### Features

* Always call AMD update hooks ([1f13d77](https://github.com/prantlf/requirejs-esm/commit/1f13d773f5c8f99599851be5f9766e0a81b6704f))

## [4.1.0](https://github.com/prantlf/requirejs-esm/compare/v4.0.0...v4.1.0) (2025-12-07)

### Features

* Support transformation and opdating hooks ([fbb6300](https://github.com/prantlf/requirejs-esm/commit/fbb6300fb4c46976c880d060a2a99070674bc67a))

## [4.0.0](https://github.com/prantlf/requirejs-esm/compare/v3.1.1...v4.0.0) (2025-11-09)

### Features

* Upgrade dependencies ([82c8cf1](https://github.com/prantlf/requirejs-esm/commit/82c8cf1b7217957cd2aaf297d1687e52f71072fa))
* Insert "use strict" to output AMD code by default ([dc9cfc5](https://github.com/prantlf/requirejs-esm/commit/dc9cfc531b8518baed9a40ad5e4a66f9c48271fc))

### BREAKING CHANGES

Each AMD module output will start with `"use strict"` by default from now on. ESM execution mode is strict by default. Comply to this in the output AMD code too. If you use a module bundler, which inserts `"use strict"` to the outer scope, you can set the `useStrict` flag to `false` to avoid inserting `"use strict"` to each inner AMD module.

## [3.1.1](https://github.com/prantlf/requirejs-esm/compare/v3.1.0...v3.1.1) (2025-05-14)

### Bug Fixes

* Upgrade dependencies ([7431ceb](https://github.com/prantlf/requirejs-esm/commit/7431cebf649383c393c804e958bc206a4c26c945))

## [3.1.0](https://github.com/prantlf/requirejs-esm/compare/v3.0.0...v3.1.0) (2025-05-14)

### Features

* Upgrade dependencies ([c024928](https://github.com/prantlf/requirejs-esm/commit/c024928dfae0b08b6121c4909798666490f606ac))

## [3.0.0](https://github.com/prantlf/requirejs-esm/compare/v2.4.0...v3.0.0) (2024-08-06)

### Bug Fixes

* Re-release 2.4.0 as 3.0.0 because of a breaking change ([05184cc](https://github.com/prantlf/requirejs-esm/commit/05184ccafd41c4f50396adcbdc65125f3ad1e46a))

### BREAKING CHANGES

The minimum version of Node.js is 18 from now on.

## [2.4.2](https://github.com/prantlf/requirejs-esm/compare/v2.4.1...v2.4.2) (2024-08-06)

### Bug Fixes

* Publish the same build output from 2.3.1 ([81d0d4e](https://github.com/prantlf/requirejs-esm/commit/81d0d4efd6c3085c7be31c313fc7954e87c8c9da))

## [2.4.1](https://github.com/prantlf/requirejs-esm/compare/v2.3.1...v2.4.1) (2024-08-06)

### Bug Fixes

* Re-release 2.3.1 to fix a breaking change in 2.4.0 ([7e9d476](https://github.com/prantlf/requirejs-esm/commit/7e9d47636a0aa11c39288e0ac7a7007dfbcc00a7))

## [2.4.0](https://github.com/prantlf/requirejs-esm/compare/v2.3.1...v2.4.0) (2024-07-26)

### Features

* Support export {default} {A as default} and {default as A} from module ([1a48783](https://github.com/prantlf/requirejs-esm/commit/1a48783362e56a86608683777b512e3d51d6aa3b))

## [2.3.1](https://github.com/prantlf/requirejs-esm/compare/v2.3.0...v2.3.1) (2023-05-05)

### Bug Fixes

* Upgrade dependencies ([1037b59](https://github.com/prantlf/requirejs-esm/commit/1037b5984e7ae75c839ad2da0a6bd6db4d7d3245))

## [2.3.0](https://github.com/prantlf/requirejs-esm/compare/v2.2.1...v2.3.0) (2022-07-10)

### Features

* Support callback bodies with CJS-like dependencies ([7ee73cd](https://github.com/prantlf/requirejs-esm/commit/7ee73cd47e3a1d64dfd7452cbdc4d22b67bbb331))

## [2.2.1](https://github.com/prantlf/requirejs-esm/compare/v2.2.0...v2.2.1) (2022-07-09)

### Bug Fixes

* Add AMD callback to the detected object ([2d09176](https://github.com/prantlf/requirejs-esm/commit/2d09176c95f6ee097bbed928348d4402a3662f46))

## [2.2.0](https://github.com/prantlf/requirejs-esm/compare/v2.1.0...v2.2.0) (2022-06-12)

### Bug Fixes

* Support arrow function expressions as module callbacks ([14df771](https://github.com/prantlf/requirejs-esm/commit/14df7715382ef1d2c6a257eafaf2649cc4d8b378))
* Upgrade dependencies ([bfd810b](https://github.com/prantlf/requirejs-esm/commit/bfd810b7e37df630e440c4b253429a93f92eaee6))

### Features

* Export detectDefinesOrRequires to allow analysing AMD modules ([fa7e8cb](https://github.com/prantlf/requirejs-esm/commit/fa7e8cbff8137fa9ae25b3b42b76e6bf7d43e29a))
* Export detectImportsAndExports to analysis of ESM modules ([84511d2](https://github.com/prantlf/requirejs-esm/commit/84511d211580c7bf569e7f309ca68b588936a006))
* Export transformAst to allow work on the level of AST ([0928227](https://github.com/prantlf/requirejs-esm/commit/0928227d03956efa7dceb7c89891cff0f874b6a0))

## [2.1.0](https://github.com/prantlf/requirejs-esm/compare/v2.0.1...v2.1.0) (2022-04-09)

### Features

* Expose an ESM module ([f83f8bd](https://github.com/prantlf/requirejs-esm/commit/f83f8bd1f59065927b0e6a53c577cbe139b790de))

## [2.0.1](https://github.com/prantlf/requirejs-esm/compare/v2.0.0...v2.0.1) (2022-04-08)

### Bug Fixes

* Allow esnext code ([fb69de9](https://github.com/prantlf/requirejs-esm/commit/fb69de9cd00672655213d5beffe4a6dc92d41949))
* Update the testing command-line tool after the API change ([23b6d7f](https://github.com/prantlf/requirejs-esm/commit/23b6d7f80fb49fa1a7eb74c451cb46ef4d4e059a))

## [2.0.0](https://github.com/prantlf/requirejs-esm/compare/v1.1.0...v2.0.0) (2022-04-04)

### Bug Fixes

* Mark `dist/api` as the main module instead of `dist/plugin` ([ddbaefa](https://github.com/prantlf/requirejs-esm/commit/ddbaefa68d1a649a0b3aa0862fe66fd9ce3a67d4))

### BREAKING CHANGES

* `dist/api` is the main module in `package.json` instead of `dist/plugin`.

The plugin was not meant to import. The API contained named exports
to be consumed. If you did import the plugin, use the full path
`requirejs-esm/dist/plugin`, just like it was used in the RequireJS
configuration of the `esm` path alias.

## [1.1.0](https://github.com/prantlf/requirejs-esm/compare/v1.0.2...v1.1.0) (2022-04-04)

### Features

* Allow transpiling without resolving relative paths and without plugin prefixing ([811419d](https://github.com/prantlf/requirejs-esm/commit/811419de01a57359bf154933abdf4fa5c0ee5d7a))

## [1.0.2](https://github.com/prantlf/requirejs-esm/compare/v1.0.1...v1.0.2) (2022-04-04)

### Bug Fixes

* Do not install dependencies for performance measuring at the consumer ([a460fc4](https://github.com/prantlf/requirejs-esm/commit/a460fc4f573065d72ed6ed8e9fd88ce8948af187))

## [1.0.1](https://github.com/prantlf/requirejs-esm/compare/v1.0.0...v1.0.1) (2022-02-17)

### Bug Fixes

* Do not transpile modules loaded from a bundle ([18c47d4](https://github.com/prantlf/requirejs-esm/commit/18c47d4658d5f76e614302193d2a114b84ff3545))

# 1.0.0 (2022-02-16)

### Features

* Release API, improve source map generation, module skipping and debugging ([872793a](https://github.com/prantlf/requirejs-esm/commit/872793a7a07d9c3a1cab1fb4272a25a50bf1121e))

## 0.0.1

Initial release.
