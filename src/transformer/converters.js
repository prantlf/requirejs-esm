import {
  identifier, memberExpression, assignmentExpression, expressionStatement
} from './factories'
import { isValidIdentifier } from './validators'
import { isIdentifierChar } from './identifier'

export function toIdentifier(input) {
  input = input + ''

  let name = ''
  for (const c of input) {
    name += isIdentifierChar(c.codePointAt(0)) ? c : '-'
  }

  name = name.replace(/^[-0-9]+/, '')

  name = name.replace(/[-\s]+(.)?/g, function (match, c) {
    return c ? c.toUpperCase() : ''
  })

  if (!isValidIdentifier(name)) {
    name = `_${name}`
  }

  return name || '_'
}

export function toExpression(node) {
  if (node.type === 'ExpressionStatement') {
    node = node.expression
  }

  const { type } = node

  if (type.endsWith('Expression')) return node

  if (type === 'ClassDeclaration') {
    node.type = 'ClassExpression'
  } else if (type === 'FunctionDeclaration') {
    node.type = 'FunctionExpression'
  }

  if (!node.type.endsWith('Expression')) {
    throw new Error(`cannot turn ${node.type} to an expression`)
  }

  return node
}

export function toStatement(node, ignore) {
  const { type } = node

  if (type.endsWith('Statement')) return node

  let mustHaveId = false
  let newType

  if (type === 'ClassDeclaration' || type === 'ClassExpression') {
    mustHaveId = true
    newType = 'ClassDeclaration'
  } else if (type === 'FunctionDeclaration' || type === 'FunctionExpression' ||
             type === 'ArrowFunctionExpression') {
    mustHaveId = true
    newType = 'FunctionDeclaration'
  } else if (type === 'AssignmentExpression') {
    return expressionStatement(node)
  }

  if (mustHaveId && !node.id) {
    newType = false
  }

  if (!newType) {
    if (ignore) {
      return false
    } else {
      throw new Error(`cannot turn ${node.type} to a statement`)
    }
  }

  node.type = newType

  return node
}

export function replaceLiteral(literal, value) {
  literal.value = value
  const { raw } = literal
  if (raw === undefined) return
  if (typeof value === 'string') {
    literal.raw = String(raw).charAt(0) === "'" ?
      `'${value.replaceAll("'", "\\'")}'` : `"${value.replaceAll('"', '\\"')}"`
  } else {
    literal.raw = String(value)
  }
}

// Returns a statement assigning a property value to the exports object.
export function exportStatement(exportsVar, key, value) {
  return toStatement(assignmentExpression('=',
    memberExpression(exportsVar, identifier(key)), value))
}
