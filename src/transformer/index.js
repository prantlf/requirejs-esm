import { detectDefinesOrRequires, updateAmdDeps, callAmdUpdateHooks } from './amd.js'
import { processOrSkipByComment } from './comments.js'
import { detectImportsAndExports, transformEsmToAmd } from './esm.js'

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
    result.updated = transformEsmToAmd(program, options)
  }
  return result
}

export { detectDefinesOrRequires, detectImportsAndExports, processOrSkipByComment }
