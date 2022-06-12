import { isAnonymousImport, isImportDefault, isImportAllAs } from './validators'
import {
  identifier, memberExpression, objectExpression, arrayExpression, blockStatement,
  variableDeclaration, variableDeclarator, returnStatement, expressionStatement,
  forInStatement, assignmentExpression, callExpression, functionExpression
} from './factories'
import { toExpression, replaceLiteral, exportStatement } from './converters'
import { generateUid, generateUidIdentifier } from './generate-id'

export function detectImports(program) {
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
              addExportStatement(specifier)
            }
            namedImports.push(declareImport(localName, importVar.name, name))
          }
        } else {
          for (const specifier of specifiers) {
            addExportStatement(specifier)
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
    // var _exports = {}
    body.unshift(
      variableDeclaration('let', [
        variableDeclarator(exportsVar, objectExpression([]))
      ])
    )

    // return <expression>
    let returnStat
    if (isOnlyDefaultExport) {
      // return _exports.default
      returnStat = returnStatement(memberExpression(exportsVar, identifier('default')))
    }
    else {
      // return _exports
      returnStat = returnStatement(exportsVar)
    }

    body.push(returnStat)
  }

  return { importPaths, importVars, namedImports }
}

// Transforms the module format from ESM to AMD.
export function transformEsmToAmd(program, options) {
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
              addExportStatement(specifier)
            }
            namedImports.push(declareImport(localName, importVar.name, name))
          }
        } else {
          for (const specifier of specifiers) {
            addExportStatement(specifier)
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
    // var _exports = {}
    body.unshift(
      variableDeclaration('let', [
        variableDeclarator(exportsVar, objectExpression([]))
      ])
    )

    // return <expression>
    let returnStat
    if (isOnlyDefaultExport) {
      // return _exports.default
      returnStat = returnStatement(memberExpression(exportsVar, identifier('default')))
    }
    else {
      // return _exports
      returnStat = returnStatement(exportsVar)
    }

    body.push(returnStat)
  }

  buildAmdModule(program, options, importPaths, importVars, namedImports)

  function addExportStatement({ exported, local }) {
    const asName = exported.name
    if (asName !== 'default') {
      isOnlyDefaultExport = false
    }
    const exportStat = exportStatement(exportsVar, asName, local)
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
  program.body = [
    expressionStatement(callExpression(
      identifier('define'), importPaths.length ? [
        prepareImportPaths(importPaths, options),
        functionExpression(importVars, blockStatement(namedImports.concat(program.body)))
      ] : [
        functionExpression([], blockStatement(program.body))
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
