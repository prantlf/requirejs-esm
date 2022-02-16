#!/usr/bin/env node

// Require module dependencies.
const commander = require('commander')
const glob = require('tiny-glob')
const { readFile, writeFile } = require('fs/promises')
const { transform } = require('../dist/api')

// Define the command-line interface.
commander.description('Transforms an ESM module to AMD or adapts an AMD module for requirejs-esm.')
  .name('esm2requirejs')
  .usage('[options] <files>')
  // .option('-e, --ecma <version>', 'change the ECMAScript version from 2020 to other one')
  .option('-p, --plugin <name>', 'change the plugin name from "esm" to other name')
  .option('-o, --output <file>', 'write the adapted module source to a file')
  .option('-r, --rewrite', 'rewrite the input files with the adapted output')
  .option('-s, --source-map', 'write inline source maps to the adapted output')
  .option('-v, --verbose', 'print progress and call stack in case of error')
  .on('--help', function () {
    console.log()
    console.log('You can use one or more file names or one or more glob patterns to specify one')
    console.log('or more files. If you set the plugin name to an empty string, modules already')
    console.log('in the AMD format will be left intact.')
    console.log()
    console.log('Examples:')
    console.log()
    console.log('  $ esm2requirejs -s -o out/main.js src/main.js')
    console.log('  $ esm2requirejs -p \'\' -r \'src/**/*.js\'')
  })
  .parse(process.argv)

const {
  /*ecma: ecmaVersion,*/
  plugin: pluginName,
  sourceMap,
  output: outputFile,
  rewrite,
  verbose
} = commander.opts()
const { args } = commander
if (!args.length) {
  commander.help()
}

// Main entry point.
(async function () {
  try {
    const files = (await Promise.all(args.map(arg => glob(arg)))).flat()
    if (!files.length) {
      throw new Error('no files found')
    }
    for (const file of files) {
      const text = await readFile(file, 'utf8')
      const code = transform(text, file, {
        /*ecmaVersion,*/
        pluginName,
        sourceMap,
        verbose
      })
      if (outputFile) {
        await writeFile(outputFile, code)
      } else if (rewrite) {
        await writeFile(file, code)
      } else {
        console.log(`// ${file}\n\n${code}`)
      }
    }
  } catch (error) {
    console.error((!verbose && error.message) || error)
    process.exitCode = 1
  }
}())
