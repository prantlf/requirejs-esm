export function literal(value) {
  return { type: 'Literal', value }
}

export function identifier(name) {
  return { type: 'Identifier', name }
}

export function memberExpression(object, property, computed) {
  return { type: 'MemberExpression', object, property, computed }
}

export function objectExpression(properties) {
  return { type: 'ObjectExpression', properties }
}

export function arrayExpression(elements) {
  return { type: 'ArrayExpression', elements }
}

export function assignmentExpression(operator, left, right) {
  return { type: 'AssignmentExpression', operator, left, right }
}

export function variableDeclaration(kind, declarations) {
  return { type: 'VariableDeclaration', kind, declarations }
}

export function variableDeclarator(id, init) {
  return { type: 'VariableDeclarator', id, init }
}

export function expressionStatement(expression) {
  return { type: 'ExpressionStatement', expression }
}

export function returnStatement(argument) {
  return { type: 'ReturnStatement', argument }
}

export function forInStatement(left, right, body) {
  return { type: 'ForInStatement', left, right, body }
}

export function blockStatement(body) {
  return { type: 'BlockStatement', body }
}

export function callExpression(callee, args) {
  return { type: 'CallExpression', callee, arguments: args }
}

export function functionExpression(params, body) {
  return { type: 'FunctionExpression', params, body }
}
