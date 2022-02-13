const { rollup } = require('rollup')
const commonjs = require('@rollup/plugin-commonjs')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const json = require('@rollup/plugin-json')
const { dirname } = require('path')
const patchPlugin = require('./patch-plugin')

const verbose = false

async function compile(input) {
  console.log(`Bundling "${input}".`)
  const bundle = await rollup({
    input,
    plugins: [
      commonjs(), nodeResolve({ browser: true, preferBuiltins: false }), json()
    ]
  })
  if (verbose) {
    console.log(bundle.watchFiles.map(path => {
      let prefix = dirname(__dirname).length + 1
      return path.substring(path.charAt(0) === '\x00' ? prefix + 1 : prefix)
    }))
  }
  return bundle
}

async function write(bundle, file, name) {
  await bundle.write({ file, format: 'umd', name, sourcemap: true })
  console.log(`Written "${file}"`)
}

async function build(file, name) {
  const bundle = await compile(`src/${file}`)
  try {
    await write(bundle, `dist/${file}`, name)
  } finally {
    await bundle.close()
  }
}

async function buildPlugin() {
  await build('plugin.js', 'requirejsEsmPlugin')
  await patchPlugin()
}

async function buildAPI() {
  await build('api.js', 'requirejsEsmAPI')
}

Promise.all([buildPlugin(), buildAPI()]).catch(error => {
  console.error(error)
  process.exitCode = 1
})
