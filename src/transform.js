import { resolvePath as originalResolvePath } from './resolve-path'
// import { parse } from 'acorn'
import { parseModule } from 'meriyah'
import { generate } from 'astring'
import { SourceMapGenerator } from 'source-map'
import convert from '@prantlf/convert-source-map'
import { transformAst, processOrSkipByComment } from './transformer'

export default function transform(text, file, {
  // Allow using a different plugin alias than `esm` in the source code.
  pluginName = 'esm',
  // Method to update paths of module dependencies, to prefix JavaScript module
  // name with `esm!`, above all.
  resolvePath = originalResolvePath,
  // Assume AMD/UMD if there're no import or export statements.
  skipIfNoImportExport,
  // ecmaVersion = 2020,
  // Do not insert `"use strict"` expression to the AMD modules. You'd set it
  // to `false` if your bundler inserts `"use strict"` to the outer scope.
  useStrict,
  // Enable source maps, can be an object with booleans { inline, content }.
  // If set to true, the object will be set to { inline: true, content: true }.
  sourceMap,
  // ESM transformation callbacks.
  onBeforeTransform,
  onAfterTransform,
  // AMD update callbacks.
  onBeforeUpdate,
  onAfterUpdate
} = {}) {
  const processOrSkip = processOrSkipByComment(text)
  if (processOrSkip === false) {
    return { code: text, map: null, updated: false }
  } else if (processOrSkip === true) {
    skipIfNoImportExport = undefined;
  }

  // const ast = parse(text, { ecmaVersion, sourceType: 'module', locations: true })
  const ast = parseModule(text, { next: true, loc: true })

  const options = {
    sourceFileName: file,
    pluginName,
    resolvePath,
    originalResolvePath,
    useStrict,
    skipIfNoImportExport,
    onBeforeTransform,
    onAfterTransform,
    onBeforeUpdate,
    onAfterUpdate
  }
  const { updated } = transformAst(ast, options)

  let code, map
  if (updated) {
    if (sourceMap === true) {
      sourceMap = { inline: true, content: true }
    }
    const mapGenerator = sourceMap ? new SourceMapGenerator({ file }) : undefined
    code = generate(ast, { sourceMap: mapGenerator })
    if (sourceMap) {
      if (sourceMap.content) {
        mapGenerator.setSourceContent(file, text)
      }
      if (sourceMap.inline) {
        code += convert.fromObject(mapGenerator.toJSON()).toComment()
      } else {
        map = mapGenerator.toJSON()
      }
    }
  } else {
    code = text
  }

  return { code, map, updated }
}
