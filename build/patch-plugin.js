const { readFile, writeFile } = require('fs/promises')
const { join } = require('path')
const { SourceMapConsumer, SourceMapGenerator } = require('source-map')
const convert = require('@prantlf/convert-source-map')

function patchCover(lines) {
  lines[2] = lines[2].replace('define(factory)', "define(['module'], factory)")
  lines[4] = lines[4].replace('function () {', 'function (module) {')
}

async function patchBundle(lines) {
  lines.splice(0, 5,
    '(function (global, factory) {',
    '  typeof exports === \'object\' && typeof module !== \'undefined\' ? module.exports = factory() :',
    '  typeof define === \'function\' && define.amd ? define([',
    '//>>excludeStart(\'excludeEsm\', pragmas.excludeEsm)',
    '      \'module\'',
    '//>>excludeEnd(\'excludeEsm\')',
    '    ], factory) :',
    '  (global = typeof globalThis !== \'undefined\' ? globalThis : global || self, global.requirejsEsmPlugin = factory());',
    '})(this, (function (',
    '//>>excludeStart(\'excludeEsm\', pragmas.excludeEsm)',
    '  module',
    '//>>excludeEnd(\'excludeEsm\')',
    ') { \'use strict\';',
    '//>>excludeStart(\'excludeEsm\', pragmas.excludeEsm)')
}

async function updateSourceMap(content, dir) {
  const converter = await convert.fromMapFileComment(content, dir, filepath =>
    readFile(filepath, 'utf8'))
  return SourceMapConsumer.with(converter.toJSON(), null, async consumer => {
    const generator = new SourceMapGenerator({ file: consumer.file })
    consumer.eachMapping(mapping => {
      const newMapping = {
        generated: {
          line: mapping.generatedLine + 9,
          column: mapping.generatedColumn
        }
      }
      if (mapping.source != null) {
        newMapping.source = mapping.source;
        newMapping.original = {
          line: mapping.originalLine,
          column: mapping.originalColumn
        }
        if (mapping.name != null) {
          newMapping.name = mapping.name
        }
      }
      generator.addMapping(newMapping)
    })
    consumer.sources.forEach(source => {
      var content = consumer.sourceContentFor(source)
      if (content) {
        generator.setSourceContent(source, content)
      }
    })
    return generator.toJSON()
  })
}

module.exports = async function patchPlugin() {
  const dir = join(__dirname, '../dist')
  const file = join(dir, 'plugin.js')
  const content = await readFile(file, 'utf8')
  const lines = content.split('\n')
  if (!lines[2].includes('define(factory)')) {
    throw new Error('define(factory) not found')
  }
  if (!lines[4].includes('function () {')) {
    throw new Error('function () { not found')
  }
  const patchProlog = process.env.PATCH_COVER ? patchCover : patchBundle
  await patchProlog(lines)
  const map = await updateSourceMap(content, dir)
  await writeFile(file, lines.join('\n'))
  await writeFile(`${file}.map`, JSON.stringify(map))
  console.log('Patched "dist/plugin.js"')
}
