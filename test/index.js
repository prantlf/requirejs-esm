const { readdir, readFile } = require('node:fs/promises')
const { join, relative } = require('node:path')
const { ok, equal } = require('node:assert')
const tehanu = require('tehanu')
const { parseModule } = require('meriyah')
const { generate } = require('astring')
const { load, write } = require('../dist/plugin')
const { transform, transformAst, resolvePath, detectDefinesOrRequires, detectImportsAndExports } = require('../dist/api')
const { req, config, onload } = require('./mock')

const test = tehanu('esm')

test('transform with sourcemap', () => {
  const code = transform('import A from "name"', 'test.js', { useStrict: false, sourceMap: true }).code
  equal(code, `define(["esm!name"], function (A) {});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QuanMiXSwibmFtZXMiOlsiQSJdLCJtYXBwaW5ncyI6IlFBQWMsdUJBQVBBIiwiZmlsZSI6InRlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQSBmcm9tIFwibmFtZVwiIl19`)
})

test('transform can skip if no import export', () => {
  const ast = parseModule('class A {}', { next: true })
  const { updated } = transformAst(ast, { sourceFileName: 'test.js', useStrict: false, skipIfNoImportExport: true })
  ok(!updated)
})

test('transform can skip by comment', () => {
  const source = `// requirejs-esm-skip-file
class A {}`
  const { updated } = transform(source, 'test.js', { useStrict: false })
  ok(!updated)
})

test('transform can process if no import export but forced by comment', () => {
  const source = `// requirejs-esm-process-file
class A {}`
  const { code, updated } = transform(source, 'test.js', { skipIfNoImportExport: true })
  ok(updated)
  equal(code, `define(function () {
  "use strict";
  class A {}
});
`)
})

test('transformAst works', () => {
  const ast = parseModule('import A from "name"', { next: true })
  const { updated } = transformAst(ast, { sourceFileName: 'test.js', pluginName: 'esm', resolvePath, useStrict: false })
  ok(updated)
  const code = generate(ast)
  equal(code, `define(["esm!name"], function (A) {});
`)
})

test('detectDefinesOrRequires works', () => {
  const ast = parseModule('my.define("main", ["name"], A => {})', { next: true })
  const modules = detectDefinesOrRequires(ast)
  equal(modules.length, 1)
  const { namespace, func, name, deps } = modules[0]
  ok(namespace)
  ok(func)
  ok(name)
  ok(deps)
})

test('detectImportsAndExports works', () => {
  const ast = parseModule('import A from "name"', { next: true })
  const { imports, exports } = detectImportsAndExports(ast)
  equal(imports.length, 1)
  equal(exports.length, 0)
})

async function pluginLoad(input) {
  const dir = relative(process.cwd(), __dirname)
  onload.init()
  load(join(dir, 'input', `${input}.js`), req, onload, config)
  const actual = await onload.promise
  const expected = await readFile(join(dir, 'output', `${input}-strict.js`), 'utf8')
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
  input = `${input}.js`
  write('esm', `test/input/${input}`, {
    asModule: (name, code) => {
      names.push(name)
      codes.push(code)
    }
  })
  equal(names.length, 2)
  equal(names[0], `test/input/${input}`)
  equal(names[1], `esm!test/input/${input}`)
  equal(codes[0], 'define(function () {\n  "use strict";\n  let _exports = {};\n  let A, B;\n  _exports.A = A;\n  _exports.B = B;\n  return _exports;\n});\n')
  equal(codes[1], `\ndefine(['test/input/${input}'], res => res);\n`)
}

test('use plugin', async () => {
  const input = 'esm-export-named-2'
  await pluginLoad(input)
  await pluginWrite(input)
})

async function testPluginValidSingle(input) {
  const content = await readFile(join(__dirname, 'input', input), 'utf8')
  const name = input === 'amd-relative.js' ? `test/input/${input}` : input
  const actual = transform(content, name, { useStrict: false }).code.trimEnd()
  const expected = (await readFile(join(__dirname, 'output', input), 'utf8')).trimEnd()
  if (expected !== actual) {
    throw new Error(`expected !== actual (${expected.length}, ${actual.length})

${expected}
${actual}`)
  }
}

function firstLineComment(text) {
  const cr = text.indexOf('\r')
  const lf = text.indexOf('\n')
  const eoln = cr < lf ? cr < 0 ? lf : cr : lf
  if (eoln < 0) throw new Error('First line with comment missing.')
  return text.slice(3, eoln)
}

async function testPluginInvalidSingle(name) {
  const content = await readFile(join(__dirname, 'invalid', name), 'utf8')
  const message = firstLineComment(content)
  try {
    transform(content, name, { useStrict: false }).code.trimEnd()
    throw new Error(`missing error: "${message}"`)
  } catch (err) {
    if (err.message !== message) {
      throw new Error(`expected error !== actual error

  "${message}"
  "${err.message}"`)
    }
  }
}

async function testPluginValid() {
  const dir = relative(process.cwd(), join(__dirname, 'input'))
  const inputs = await readdir(dir)
  const filter = process.env.TEST_INPUT
  for (const input of inputs) {
    if (filter && input !== filter) continue
    test(input, () => testPluginValidSingle(input))
  }
}

async function testPluginInvalid() {
  const dir = relative(process.cwd(), join(__dirname, 'invalid'))
  const inputs = await readdir(dir)
  const filter = process.env.TEST_INPUT
  for (const input of inputs) {
    if (filter && input !== filter) continue
    test(input, () => testPluginInvalidSingle(input))
  }
}

async function testPluginAll() {
  await testPluginValid()
  await testPluginInvalid()
  await tehanu.schedule()
}

testPluginAll().catch(error => {
  console.error(error)
  process.exitCode = 1
})
