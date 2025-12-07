import { isAnonymousImport, isImportDefault, isImportAllAs } from './validators'
import {
  identifier, memberExpression, objectExpression, arrayExpression, blockStatement,
  variableDeclaration, variableDeclarator, returnStatement, expressionStatement,
  forInStatement, assignmentExpression, callExpression, functionExpression,
  literal
} from './factories'
import { toExpression, replaceLiteral, exportStatement } from './converters'
import { generateUid, generateUidIdentifier } from './generate-id'

// Detects if a program contains import statements.
// Returns information about the import statemets [{ node, source, specifiers|local }, ...] or [].
export function detectImportsAndExports(program) {
  const { body } = program
  const { length } = body

  const imports = []
  const exports = []

  for (let i = 0; i < length; ++i) {
    const node = body[i]

    // import
    if (node.type === 'ImportDeclaration') {
      const { source } = node

      // import "some"
      if (isAnonymousImport(node)) {
        imports.push({ node, source })
      }
      // import some from "some"
      // import * as some from "some"
      else if (isImportDefault(node) || isImportAllAs(node)) {
        const { local } = node.specifiers[0]
        imports.push({ node, source, local })
      }
      // import {x, y, z} from "xyz"
      else {
        const specifiers = node.specifiers.map(({ imported, local }) => ({ imported, local }))
        imports.push({ node, source, specifiers })
      }
    }

    // export default
    else if (node.type === 'ExportDefaultDeclaration') {
      exports.push({ node, default: true })
    }

    // export {x as y}
    // export var a = 1
    // export function test() {}
    // export class Test {}
    else if (node.type === 'ExportNamedDeclaration') {
      const { specifiers } = node

      // export var a = 1
      if (!specifiers.length) {
        exports.push({ node })
      } else { // export {x as y}
        // export { ... } from "module"
        const { source } = node
        if (source) {
          exports.push({ node, source, import: true })
          const specifiers = node.specifiers.map(({ exported: imported, local }) => ({ imported, local }))
          imports.push({ node, source, specifiers, export: true })
        } else {
          exports.push({ node })
        }
      }
    }

    // export * from "module"
    if (node.type === 'ExportAllDeclaration') {
      exports.push({ node, import: true })
      const { source } = node
      imports.push({ node, source, export: true })
    }
  }

  return { imports, exports }
}

// Transforms the module format from ESM to AMD.
export function transformEsmToAmd(program, options) {
  options.onBeforeTransform?.({
    ...options,
    program
  })

  const { body } = program
  let { length } = body

  const importPaths = []
  const importVars = []
  const namedImports = []
  const localImports = new Set()

  const exportsVar = generateUidIdentifier('exports', program, program)
  let hasExport = false
  let needReturnExport = false
  let isOnlyDefaultExport = true
  let defaultExportVar

  for (let i = 0; i < length; ++i) {
    const statement = body[i]

    // import
    if (statement.type === 'ImportDeclaration') {
      // save import path
      const exportSource = statement.source
      importPaths.push(exportSource)

      const importNode = statement
      // import "some"
      if (isAnonymousImport(importNode)) {
        // importVars.length should be equal importPaths.length
        const importVar = generateUidIdentifier(exportSource.value, program)
        importVars.push(importVar)
      }
      // import some from "some"
      // import * as some from "some"
      else if (isImportDefault(importNode) || isImportAllAs(importNode)) {
        const asName = importNode.specifiers[0].local
        importVars.push(asName)
      }
      // import {x, y, z} from "xyz"
      else {
        // convert "/path/to/a" to _pathToA
        const asName = generateUidIdentifier(exportSource.value, program)
        importVars.push(asName)

        for (const { imported, local } of importNode.specifiers) {
          const { name } = local
          localImports.add(name)
          namedImports.push(declareImport(name, asName.name, imported.name))
        }
      }

      body.splice(i--, 1)
      --length
    }

    // export default
    if (statement.type === 'ExportDefaultDeclaration') {
      // need return at end file
      hasExport = true
      needReturnExport = true

      // expression after keyword default
      const { declaration } = statement
      let exportValue = declaration
      let needExportExpression = true

      if (declaration.type === 'FunctionDeclaration') {
        exportValue = toExpression(exportValue)
      }
      if (declaration.type === 'ClassDeclaration') {
        exportValue = toExpression(exportValue)
        // const classNode = exportValue

        // if (classNode.id) {
        //   body[i] = classNode

        //   const className = identifier(classNode.id.name)
        //   let exportStat
        //   if (i + 1 === length && isOnlyDefaultExport) {
        //     exportStat = returnStatement(identifier(className))
        //     needReturnExport = false
        //   } else {
        //     exportStat = exportStatement(exportsVar, 'default', className)
        //   }

        //   program.pushContainer('body', [exportStat])
        //   needExportExpression = false
        // } else {
        //   exportValue = toExpression(classNode)
        // }
      }

      if (needExportExpression) {
        let exportStat

        if (i + 1 === length && isOnlyDefaultExport) {
          exportStat = returnStatement(exportValue)
          needReturnExport = false
        } else {
          exportStat = exportStatement(exportsVar, 'default', exportValue)
        }

        body[i] = exportStat
      }
    }

    // export {x as y}
    // export var a = 1
    // export function test() {}
    // export class Test {}
    // export {default as A} from "module"
    if (statement.type === 'ExportNamedDeclaration') {
      hasExport = true
      needReturnExport = true

      const { specifiers, declaration } = statement

      // export var a = 1
      if (!specifiers.length) {
        isOnlyDefaultExport = false

        // replace "export <expression>"
        // to "<expression>"
        body[i] = declaration

        // export var a = 1, b = 2
        if (declaration.type === 'VariableDeclaration') {
          for (const { id } of declaration.declarations) {
            const { name } = id
            const exportStat = exportStatement(exportsVar, name, identifier(name))
            body.push(exportStat)
          }
        }

        // export function x() {}
        if (declaration.type === 'FunctionDeclaration') {
          const asName = declaration.id.name

          const exportStat = exportStatement(exportsVar, asName, identifier(asName))
          body.push(exportStat)
        }

        // export class Test {}
        if (declaration.type === 'ClassDeclaration') {
          const asName = declaration.id.name

          const exportStat = exportStatement(exportsVar, asName, identifier(asName))
          body.push(exportStat)
        }
      } else { // export {x as y}
        // export { ... } from "module"
        const exportSource = statement.source
        if (exportSource) {
          // save import path
          importPaths.push(exportSource)
          // importVars.length should be equal importPaths.length
          const importVar = generateUidIdentifier(exportSource.value, program)
          importVars.push(importVar)

          for (let specifier of specifiers) {
            const { exported, local } = specifier
            const { name } = local
            let localName
            // newly re-exporting earlier imported identifier
            if (localImports.has(name)) {
              localName = generateUid(name, program)
              addExportStatement({ exported, local: identifier(localName) })
            } else {
              localName = name
              if (localName === 'default') {
                if (exported.name === 'default') {
                  // export {default} from "module"
                  defaultExportVar = importVar
                } else {
                  // export {default as A} from "module"
                  addExportDefaultStatement(exported, importVar)
                }
              } else if (exported.name === 'default') {
                // export {A as default} from "module"
                defaultExportVar = importVar
              } else {
                // export {A as B} from "module"
                addExportStatement(specifier)
              }
            }
            if (localName !== 'default' && !defaultExportVar) {
              // _exports.B = A;
              namedImports.push(declareImport(localName, importVar.name, name))
            }
          }
        } else {
          for (const specifier of specifiers) {
            const { exported, local } = specifier
            if (local.name === 'default') {
              if (exported.name === 'default') {
                // export {default}
                throw new Error('Expression `export { default }` is not supported.')
              } else {
                // export {default as A}
                throw new Error(`Expression \`export { default as ${exported.name} }\` is not supported.`)
              }
            } else if (exported.name === 'default') {
              // export {A as default}
              defaultExportVar = local
            } else {
              // export {A as B}
              addExportStatement(specifier)
            }
          }
        }

        body.splice(i--, 1)
        --length
      }
    }

    // export * from "module"
    if (statement.type === 'ExportAllDeclaration') {
      isOnlyDefaultExport = false
      hasExport = true
      needReturnExport = true

      // save import path
      const exportSource = statement.source
      importPaths.push(exportSource)
      // importVars.length should be equal importPaths.length
      const importVar = generateUidIdentifier(exportSource.value, program)
      importVars.push(importVar)

      body[i] = exportCopyLoop(exportsVar, importVar)
    }
  }

  // adding define wrapper
  if (hasExport && needReturnExport) {
    let returnStat
    if (defaultExportVar) {
      // return _import
      returnStat = returnStatement(defaultExportVar)
    } else {
      // var _exports = {}
      body.unshift(
        variableDeclaration('let', [
          variableDeclarator(exportsVar, objectExpression([]))
        ])
      )

      // return <expression>
      if (isOnlyDefaultExport) {
        // return _exports.default
        returnStat = returnStatement(memberExpression(exportsVar, identifier('default')))
      }
      else {
        // return _exports
        returnStat = returnStatement(exportsVar)
      }
    }

    body.push(returnStat)
  }

  buildAmdModule(program, options, importPaths, importVars, namedImports)

  options.onAfterTransform?.({
    ...options,
    program,
    callbackBody: body
  })

  function addExportStatement({ exported, local }) {
    const asName = exported.name
    if (asName !== 'default') {
      isOnlyDefaultExport = false
    }
    const exportStat = exportStatement(exportsVar, asName, local)
    body.push(exportStat)
  }

  function addExportDefaultStatement(exported, imported) {
    const asName = exported.name
    if (asName !== 'default') {
      isOnlyDefaultExport = false
    }
    const exportStat = exportStatement(exportsVar, asName, imported)
    body.push(exportStat)
  }
}

function declareImport(varName, object, property) {
  return variableDeclaration('let', [
    variableDeclarator(
      identifier(varName),
      memberExpression(identifier(object), identifier(property))
    )
  ])
}

function exportCopyLoop(exportsVar, importVar) {
  const key = identifier('_key')
  return forInStatement(
    variableDeclaration('const', [variableDeclarator(key)]),
    importVar,
    blockStatement([
      expressionStatement(
        assignmentExpression('=',
          memberExpression(exportsVar, key, true), memberExpression(importVar, key, true)))
    ])
  )
}

// Wraps a program body of statements into an AMD module.
function buildAmdModule(program, options, importPaths, importVars, namedImports) {
  const body = []
  if (options.useStrict !== false) {
    body.push(expressionStatement(literal('use strict')))
  }
  if (namedImports.length) {
    body.push(...namedImports)
  }
  body.push(...program.body)
  const bodyStatement = blockStatement(body)
  program.body = [
    expressionStatement(callExpression(
      identifier('define'), importPaths.length ? [
        prepareImportPaths(importPaths, options),
        functionExpression(importVars, bodyStatement)
      ] : [
        functionExpression([], bodyStatement)
      ]))
  ]
}

// Update dependency paths to be prefixed by `esm!` or otherwise updated.
function prepareImportPaths(importPaths, options ) {
  const { resolvePath } = options
  if (resolvePath) {
    const { sourceFileName: parentName } = options
    for (const importPath of importPaths) {
      if (importPath.type === 'Literal') {
        const moduleName = importPath.value
        const newModuleName = resolvePath(moduleName, parentName, options)
        if (newModuleName && newModuleName !== moduleName) {
          replaceLiteral(importPath, newModuleName)
        }
      }
    }
  }
  return arrayExpression(importPaths)
}
