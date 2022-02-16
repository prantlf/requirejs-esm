const { readdir, readFile } = require('fs/promises')
const { join, relative } = require('path')
const { equal } = require('assert')
const tehanu = require('tehanu')
const test = tehanu('esm')
const { load, write } = require('..')
const { transform } = require('../dist/api')
const { req, config, onload } = require('./mock')

test('transform with sourcemap', function () {
  const code = transform('import A from "name"', 'test.js', { sourceMap: true }).code
  equal(code, `define(["esm!name"], function (A) {});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QuanMiXSwibmFtZXMiOlsiQSJdLCJtYXBwaW5ncyI6IlFBQWMsdUJBQVBBIiwiZmlsZSI6InRlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQSBmcm9tIFwibmFtZVwiIl19`)
})

async function pluginLoad(input) {
  const dir = relative(process.cwd(), __dirname)
  onload.init()
  load(join(dir, 'input', input), req, onload, config)
  const actual = await onload.promise
  const expected = await readFile(join(dir, 'output', input), 'utf8')
  if (expected !== actual) {
    console.log()
    throw new Error(`expected !== actual

${expected}
${actual}`)
  }
}

async function pluginWrite(input) {
  const names = []
  const codes = []
  write('esm', `test/input/${input}`, {
    asModule: (name, code) => {
      names.push(name)
      codes.push(code)
    }
  })
  equal(names.length, 2)
  equal(names[0], `test/input/${input}`)
  equal(names[1], `esm!test/input/${input}`)
  equal(codes[0], 'define(function () {\n  let _exports = {};\n  let A, B;\n  _exports.A = A;\n  _exports.B = B;\n  return _exports;\n});\n')
  equal(codes[1], `\ndefine(['test/input/${input}'], res => res);\n`)
}

test('use plugin', async function () {
  const input = 'esm-export-named-2.js'
  await pluginLoad(input)
  await pluginWrite(input)
})

async function testPluginSingle(input) {
  const content = await readFile(join(__dirname, 'input', input), 'utf8')
  const name = input === 'amd-relative.js' ? `test/input/${input}` : input
  const actual = transform(content, name).code.trimEnd()
  const expected = (await readFile(join(__dirname, 'output', input), 'utf8')).trimEnd()
  if (expected !== actual) {
    throw new Error(`expected !== actual (${expected.length}, ${actual.length})

${expected}
${actual}`)
  }
}

async function testPluginAll() {
  const dir = relative(process.cwd(), join(__dirname, 'input'))
  const inputs = await readdir(dir)
  for (const input of inputs) {
    test(input, () => testPluginSingle(input))
  }
  await tehanu.schedule()
}

testPluginAll().catch(error => {
  console.error(error)
  process.exitCode = 1
})
