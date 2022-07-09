import { replaceLiteral } from './converters'

// Detects if an expression calls define or require function.
// Returns information about an AMD module false, { deps } or [{ deps }, ...].
function detectDefineOrRequireCall(expr) {
  if (expr.type !== 'CallExpression') return false

  const args = expr.arguments
  const { length } = args
  if (length === 0) return false

  const { callee } = expr
  let namespace, func
  // namespace.define(...)
  if (callee.type === 'MemberExpression') {
    const { object } = callee
    if (object.type !== 'Identifier') return false
    namespace = object
    func = callee.property
  } else {
    func = callee
  }
  if (func.type !== 'Identifier') return false

  // define('name', [deps], factory)
  if (func.name === 'define') {
    let index = 0
    let arg = args[index]
    let name, deps
    if (arg.type === 'Literal') {
      if (length <= ++index || typeof arg.value !== 'string') return false
      name = arg
      arg = args[index]
    }
    if (arg.type === 'ArrayExpression') {
      deps = arg
      if (length <= ++index) return false
      arg = args[index]
    }
    if (arg.type === 'FunctionExpression' || arg.type === 'ArrowFunctionExpression') {
      return { namespace, func, name, deps, factory: arg }
    }
    return arg.type === 'ObjectExpression' && { namespace, func, name, deps, output: arg }
  }

  // require([deps], success, error)
  if (func.name === 'require') {
    const deps = args[0]
    if (deps.type === 'ArrayExpression' && length >= 2) {
      const body = args[1]
      if (body.type === 'FunctionExpression' || body.type === 'ArrowFunctionExpression') {
        return { func, deps, body }
      }
    }
  }
}

// Detects if a program contains statements calling define or require function.
// Returns information about AMD modules false, { deps } or [{ deps }, ...].
function detectDefineOrRequire(stat) {
  if (stat.type !== 'ExpressionStatement') return false
  const { expression } = stat

  // multiple define/require statements in one file
  if (expression.type === 'SequenceExpression') {
    return expression
      .expressions
      .map(detectDefineOrRequireCall)
      .reduce((all, one) => one ? all.concat(one) : all, [])
  }

  return detectDefineOrRequireCall(expression)
}

// Detects if a program contains statements calling define or require function.
// Returns information about the AMD modules [{ deps }, ...] or [].
export function detectDefinesOrRequires(program) {
  const { body } = program
  return body
    .map(detectDefineOrRequire)
    .reduce((all, one) => one ? all.concat(one) : all, [])
}

// Updates dependency paths to be prefixed by `esm!` or otherwise updated.
export function updateAmdDeps(amd, options) {
  const { deps } = amd
  if (!deps) return

  const { sourceFileName: parentName } = options
  const { elements } = deps
  if (!elements.length) return

  const { resolvePath } = options
  let updated
  for (const element of elements) {
    if (element.type === 'Literal') {
      const moduleName = element.value
      const newModuleName = resolvePath(moduleName, parentName, options)
      if (newModuleName && newModuleName !== moduleName) {
        replaceLiteral(element, newModuleName)
        updated = true
      }
    }
  }
  return updated
}
