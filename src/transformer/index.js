import { detectDefinesOrRequires, updateAmdDeps, callAmdUpdateHooks } from './amd'
import { detectImportsAndExports, transformEsmToAmd } from './esm'

export function transformAst(program, options = {}) {
  const amds = detectDefinesOrRequires(program)
  const { length } = amds
  const result = {}
  if (length) {
    result.amd = true
    for (const amd of amds) {
      const updated = options.resolvePath
        ? updateAmdDeps(amd, options)
        : callAmdUpdateHooks(amd, options)
      result.updated ||= updated
    }
  } else {
    transformEsmToAmd(program, options)
    result.updated = true
  }
  return result
}

export { detectDefinesOrRequires, detectImportsAndExports }
