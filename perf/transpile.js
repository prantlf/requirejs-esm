const { join } = require('path')
const filesize = require('filesize')
const { readFile } = require('fs/promises')
const { createSuite } = require('./suite')
const { transform: transformEsm } = require('../dist/api')
const { transform: transformEs6 } = require('requirejs-babel7/api')

const names = [
  'ast',
  'default-options',
  'detection',
  'format-message',
  'interpreter',
  'library/assoc',
  'library/checks',
  'library/index',
  'library/list',
  // 'library/regex',
  'library/str',
  'library/web',
  'messages',
  'parser',
  // 'scope',
  'tokens',
  'walker',
  'walkers',
]

async function warmEsm() {
  await transformEsm('import a from "a"', 'warm')
}

async function transpileEsm(name, content, deferred) {
  await transformEsm(content, name)
  deferred.resolve()
}

async function transpileManyEsm(files, deferred) {
  for (const file of files) {
    await transformEsm(file, 'total')
  }
  deferred.resolve()
}

function warmEs6() {
  transformEs6('import a from "a"', 'warm')
}

function transpileEs6(name, content) {
  transformEs6(content, name)
}

function transpileManyEs6(files) {
  for (const file of files) {
    transformEs6(file, 'total')
  }
}

async function transpileAll() {
  await warmEsm()
  warmEs6()
  const suite = createSuite('Transpile osparser sources...')
  const files = []
  let totalLines = 0
  let totalSize = 0
  for (const name of names) {
    const content = await readFile(join(__dirname, 'oscript', `${name}.js`), 'utf8')
    const lines = content.split(/\r?\n/g)
    files.push(content)
    totalSize += content.length
    totalLines += lines.length
    console.log(`  ${name}: ${lines.length} lines, ${filesize(content.length)}`)
    suite.add(`esm: ${name}`, deferred => transpileEsm(name, content, deferred), { defer: true })
    suite.add(`es6: ${name}`, () => transpileEs6(name, content))
  }
  console.log(`  total: ${totalLines} lines, ${filesize(totalSize)}`)
  suite.add('esm: total', deferred => transpileManyEsm(files, deferred), { defer: true })
  suite.add('es6: total', () => transpileManyEs6(files))
  suite.start()
}

transpileAll().catch(error => {
  console.error(error)
  process.exitCode = 1
})
