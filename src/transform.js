import { default as originalResolvePath } from './resolve-path'
// import { parse } from 'acorn'
import { parseModule } from 'meriyah'
// import { optimize, mangle } from 'esmangle'
import { generate } from 'astring'
// import { generate as generateMinified, FORMAT_MINIFY } from 'escodegen'
// import { minify as generateMinified } from 'terser'
import { SourceMapGenerator } from 'source-map'
import convert from '@prantlf/convert-source-map'
import transformModules from './transformer'

export default function transform(text, file, {
  // Allow using a different plugin alias than `esm` in the source code.
  pluginName = 'esm',
  // Method to update paths of module dependencies, to prefix JavaScript module
  // name with `esm!`, above all.
  resolvePath = originalResolvePath,
  // ecmaVersion = 2020,
  // minify,
  sourceMap
} = {}) {
  // const ast = parse(text, { ecmaVersion, sourceType: 'module', locations: true })
  let ast = parseModule(text, { loc: true })

  const options = { sourceFileName: file, pluginName, resolvePath, originalResolvePath }
  transformModules(ast, options)

  let code
  if (options.updated) {
    // if (minify) {
    //   const optimized = optimize(ast)
    //   ast = mangle(optimized)
    // }
    // if (minify) {
    //   ({ code, map: sourceMap } = generateMinified(ast, {
    //     format: FORMAT_MINIFY,
    //     sourceMap: sourceMap ? file : undefined,
    //     sourceMapWithCode: true,
    //     sourceContent: text,
    //     file
    //   }))
    //   if (sourceMap) {
    //     code += convert.fromJSON(sourceMap).toComment()
    //   }
    // }
    // if (minify) {
    //   ({ code } = await generateMinified(ast, {
    //     // ecma: ecmaVersion,
    //     module: true,
    //     parse: { spidermonkey: true },
    //     format: { ecma: 2015 },
    //     sourceMap: sourceMap ? {
    //       filename: file,
    //       url: 'inline'
    //       // content: map
    //     } : undefined
    //   }))
    // } else {
    sourceMap = sourceMap && new SourceMapGenerator({ file })
    code = generate(ast, { sourceMap })
    if (sourceMap) {
      code += convert.fromJSON(sourceMap).toComment()
    }
    // }
  } else {
    code = text
  }

  return code
}
