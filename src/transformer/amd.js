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
    let name, deps, params
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
      if (!deps) {
        ({ params, deps } = detectCjsDeps(arg) || {})
      } else {
        params = arg.params
      }
      return { namespace, func, name, deps, params, factory: arg }
    }
    return arg.type === 'ObjectExpression' && { namespace, func, name, deps, output: arg }
  }

  // require([deps], success, [error])
  if (func.name === 'require') {
    const arg = args[0]
    if (arg.type === 'ArrayExpression') {
      if (length < 2) return false
      const body = args[1]
      if (body.type === 'FunctionExpression' || body.type === 'ArrowFunctionExpression') {
        return { func, deps: arg, params: body.params, body }
      }
    } else if (arg.type === 'FunctionExpression' || arg.type === 'ArrowFunctionExpression') {
      const { params, deps } = detectCjsDeps(arg) || {}
      return { func, params, deps, body: arg }
    }
  }
}

// Checks if the expression parameters can support CJS-like require calls
// in the expression body.
function isCjsExpression(expr) {
  const { params } = expr;
  if (!params.length) return false
  const param = params[0]
  return param.type === 'Identifier' && param.name === 'require'
}

// Detects variable declarations with CJS-like require calls and such require
// calls on the first level of the expression body.
function detectCjsDeps(expr) {
  if (!isCjsExpression(expr)) return
  const params = []
  const namedDeps = []
  const unnamedDeps = []
  for (const statement of expr.body.body || []) {
    const { type } = statement
    if (type === 'VariableDeclaration') {
      for (const declarator of statement.declarations) {
        const { id } = declarator
        if (id && id.type === 'Identifier') {
          const { init } = declarator
          if (init && init.type === 'CallExpression') {
            const { callee } = init
            if (callee.type === 'Identifier' && callee.name === 'require') {
              const { arguments: args } = init
              if (args.length === 1) {
                const arg = args[0]
                if (arg.type === 'Literal') {
                  params.push(id)
                  namedDeps.push(arg)
                }
              }
            }
          }
        }
      }
    } else if (type === 'ExpressionStatement') {
      const { expression } = statement
      if (expression.type === 'CallExpression') {
        const { callee } = expression
        if (callee.type === 'Identifier' && callee.name === 'require') {
          const { arguments: args } = expression
          if (args.length === 1) {
            const arg = args[0]
            if (arg.type === 'Literal') {
              unnamedDeps.push(arg)
            }
          }
        }
      }
    }
  }
  let deps = [...namedDeps, ...unnamedDeps]
  if (deps.length) {
    deps = { type: 'ArrayExpression', elements: deps }
    return { params, deps }
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
  let updated = options.onBeforeUpdate?.({
    ...options,
    amd
  })

  const { deps } = amd
  if (!deps) {
    afterUpdate()
    return updated
  }

  const { sourceFileName: parentName } = options
  const { elements } = deps
  if (!elements.length) {
    afterUpdate()
    return updated
  }

  const { resolvePath } = options
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

  afterUpdate()

  return updated

  function afterUpdate() {
    const updatedNow = options.onAfterUpdate?.({
      ...options,
      amd
    })
    updated ||= updatedNow
  }
}

export function callAmdUpdateHooks(amd, options) {
  options = {
    ...options,
    amd
  }
  const updatedBefore = options.onBeforeUpdate?.(options)
  const updatedAfter = options.onAfterUpdate?.(options)
  return updatedBefore || updatedAfter
}
