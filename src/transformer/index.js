import { detectDefinesOrRequires, updateAmdDeps } from './amd'
import { detectImportsAndExports, transformEsmToAmd } from './esm'

export function transformAst(program, options = {}) {
  const amds = detectDefinesOrRequires(program)
  const { length } = amds
  const result = {}
  if (length) {
    result.amd = true
    if (options.resolvePath) {
      for (const amd of amds) {
        result.updated |= updateAmdDeps(amd, options)
      }
    }
  } else {
    transformEsmToAmd(program, options)
    result.updated = true
  }
  return result
}

export { detectDefinesOrRequires, detectImportsAndExports }
