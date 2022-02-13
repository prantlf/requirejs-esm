import { isIdentifierName } from './identifier'
import { isKeyword, isStrictReservedWord } from './keywords'

export function isValidIdentifier(name, reserved = true) {
  if (typeof name !== 'string') return false
  if (reserved && (isKeyword(name) || isStrictReservedWord(name, true))) return false
  return isIdentifierName(name)
}

// Checks an anonymous import.
export function isAnonymousImport(importNode) {
  // import "some"
  return importNode.specifiers.length === 0
}

// Checks a default import.
export function isImportDefault(importNode) {
  // import some from "some"
  return importNode.specifiers.length === 1 &&
    importNode.specifiers[0].type === 'ImportDefaultSpecifier'
}

// Checks importing all named exports to an object.
export function isImportAllAs(importNode) {
  // import * as some from "some"
  return importNode.specifiers.length === 1 &&
    importNode.specifiers[0].type !== 'ImportDefaultSpecifier' &&
    !importNode.specifiers[0].imported
}
