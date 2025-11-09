({
  baseUrl: './',

  name: 'src/index',
  out: 'main-built.js',

  paths: {
    esm: '../dist/plugin',
    'lit-html': '../node_modules/lit-html'
  },

  optimize: 'none',
  generateSourceMaps: true,
  preserveLicenseComments: false,

  config: {
    esm: {
      sourceMap: true,
      useStrict: false
    }
  },

  pragmasOnSave: {
    excludeEsm: true
  }
})
