({
  baseUrl: './',

  name: 'src/index',
  out: 'main-built.js',

  paths: {
    esm: '../dist/plugin'
  },

  optimize: 'none',
  generateSourceMaps: true,
  preserveLicenseComments: false,

  config: {
    esm: {
      sourceMap: true
    }
  },

  pragmasOnSave: {
    excludeEsm: true
  }
})
