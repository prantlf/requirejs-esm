# [2.0.0](https://github.com/prantlf/requirejs-esm/compare/v1.1.0...v2.0.0) (2022-04-04)


### Bug Fixes

* Mark `dist/api` as the main module instead of `dist/plugin` ([ddbaefa](https://github.com/prantlf/requirejs-esm/commit/ddbaefa68d1a649a0b3aa0862fe66fd9ce3a67d4))


### BREAKING CHANGES

* `dist/api` is the main module in `package.json` instead of `dist/plugin`.

The plugin was not meant to import. The API contained named exports
to be consumed. If you did import the plugin, use the full path
`requirejs-esm/dist/plugin`, just like it was used in the RequireJS
configuration of the `esm` path alias.

# [1.1.0](https://github.com/prantlf/requirejs-esm/compare/v1.0.2...v1.1.0) (2022-04-04)


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
