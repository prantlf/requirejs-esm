import { resolvePath as originalResolvePath } from './resolve-path'
// import { parse } from 'acorn'
import { parseModule } from 'meriyah'
import { generate } from 'astring'
import { SourceMapGenerator } from 'source-map'
import convert from '@prantlf/convert-source-map'
import { transformAst } from './transformer'

export default function transform(text, file, {
  // Allow using a different plugin alias than `esm` in the source code.
  pluginName = 'esm',
  // Method to update paths of module dependencies, to prefix JavaScript module
  // name with `esm!`, above all.
  resolvePath = originalResolvePath,
  // ecmaVersion = 2020,
  sourceMap
} = {}) {
  // const ast = parse(text, { ecmaVersion, sourceType: 'module', locations: true })
  let ast = parseModule(text, { next: true, loc: true })

  const options = { sourceFileName: file, pluginName, resolvePath, originalResolvePath }
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
