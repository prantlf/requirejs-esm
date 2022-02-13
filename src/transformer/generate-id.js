import { isAnonymousImport, isImportDefault, isImportAllAs } from './validators'
import { identifier } from './factories'
import { toIdentifier } from './converters'

function _generateUid(name, i) {
  let id = name
  if (i > 1) id += i
  return `_${id}`
}

function getUids(program) {
  const uids = new Set()
  for (const statement of program.body) {
    const { type } = statement
    if (type === 'LabeledStatement') {
      const { label } = statement
      if (label) {
        uids.add(label.name)
      }
    } else if (type === 'ImportDeclaration') {
      // import some from "some"
      // import * as some from "some"
      if (isImportDefault(statement) || isImportAllAs(statement)) {
        uids.add(statement.specifiers[0].local.name)
      }
      // import {x, y, z} from "xyz"
      else if (!isAnonymousImport(statement)) {
        for (const { local } of statement.specifiers) {
          uids.add(local.name)
        }
      }
    } else if (type === 'ExportNamedDeclaration') {
      const { declaration } = statement
      if (declaration) {
      const { type } = declaration
        // export var a = 1
        if (type === 'VariableDeclaration') {
          for (const { id } of declaration.declarations) {
            uids.add(id.name)
          }
        }
        // export function test() {}
        // export class Test {}
        else if (type === 'FunctionDeclaration' || type === 'ClassDeclaration') {
          uids.add(declaration.id.name)
        }
        // export {x as y}
        else {
          for (const { local } of statement.specifiers) {
            uids.add(local.name)
          }
        }
      }
    } else if (type === 'VariableDeclaration') {
      for (const { id } of statement.declarations) {
        if (id.type === 'Identifier') {
          uids.add(id.name)
        } else {
          for (const { value } of id.properties) {
            uids.add(value.name)
          }
        }
      }
    } else if (type === 'FunctionDeclaration' || type === 'ClassDeclaration') {
      uids.add(statement.id.name)
    }
  }
  return uids
}

function tryAddUid(uid, program) {
  let { _uids } = program
  if (!_uids) {
    _uids = program._uids = getUids(program)
  }
  if (_uids.has(uid)) return true
  _uids.add(uid)
}

export function generateUid(name, program) {
  name = toIdentifier(name)
    .replace(/^_+/, '')
    .replace(/[0-9]+$/g, '')

  let uid
  let i = 1
  do {
    uid = _generateUid(name, i++)
  } while (tryAddUid(uid, program))

  return uid
}

export function generateUidIdentifier(name, program) {
  return identifier(generateUid(name, program))
}
