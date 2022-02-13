import { detectDefinesOrRequires, updateAmdDeps } from './amd'
import { transformEsmToAmd } from './esm'

export default function transformModules(program, options) {
  const amds = detectDefinesOrRequires(program)
  const { length } = amds
  if (length) {
    options.amd = true
    if (options.pluginName) {
      for (const amd of amds) {
        options.updated |= updateAmdDeps(amd, options)
      }
    }
  } else {
    transformEsmToAmd(program, options)
    options.updated = true
  }
}
