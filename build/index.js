import { mkdir, writeFile } from 'node:fs/promises'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { rollup } from 'rollup'
import patchPlugin from './patch-plugin.js'

const verbose = false

async function compile(input) {
  console.log(`Bundling "${input}".`)
  const bundle = await rollup({
    input,
    plugins: [commonjs(), nodeResolve({ browser: true, preferBuiltins: false }), json()]
  })
  if (verbose) {
    console.log(
      bundle.watchFiles.map(path => {
        let prefix = import.meta.dirname.length + 1
        return path.substring(path.charAt(0) === '\x00' ? prefix + 1 : prefix)
      })
    )
  }
  return bundle
}

async function write(bundle, file, options) {
  await bundle.write({ file, sourcemap: true, ...options })
  console.log(`Written "${file}"`)
}

async function buildPlugin() {
  const bundle = await compile('src/plugin.js')
  try {
    await write(bundle, 'dist/plugin.js', { format: 'umd', name: 'requirejsEsmPlugin' })
    await patchPlugin()
  } finally {
    await bundle.close()
  }
}

async function buildAPI() {
  const bundle = await compile('src/api.js')
  try {
    await write(bundle, 'dist/api.js', { format: 'umd', name: 'requirejsEsmAPI' })
  } finally {
    await bundle.close()
  }
}

async function writePackage() {
  await mkdir('dist', { recursive: true })
  await writeFile(
    'dist/package.json',
    `{
  "private": true,
  "type": "commonjs"
}`
  )
}

await Promise.all([buildPlugin(), buildAPI(), writePackage()])
