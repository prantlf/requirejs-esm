const reservedWords = {
  keyword: [
    'break',
    'case',
    'catch',
    'continue',
    'debugger',
    'default',
    'do',
    'else',
    'finally',
    'for',
    'function',
    'if',
    'return',
    'switch',
    'throw',
    'try',
    'var',
    'const',
    'while',
    'with',
    'new',
    'this',
    'super',
    'class',
    'extends',
    'export',
    'import',
    'null',
    'true',
    'false',
    'in',
    'instanceof',
    'typeof',
    'void',
    'delete'
  ],
  strict: [
    'implements',
    'interface',
    'let',
    'package',
    'private',
    'protected',
    'public',
    'static',
    'yield'
  ],
  strictBind: ['eval', 'arguments']
}
const keywords = new Set(reservedWords.keyword)
const reservedWordsStrictSet = new Set(reservedWords.strict)
const reservedWordsStrictBindSet = new Set(reservedWords.strictBind)

export function isReservedWord(word, inModule) {
  return inModule && word === 'await' || word === 'enum'
}

export function isStrictReservedWord(word, inModule) {
  return isReservedWord(word, inModule) || reservedWordsStrictSet.has(word)
}

export function isStrictBindOnlyReservedWord(word) {
  return reservedWordsStrictBindSet.has(word)
}

export function isStrictBindReservedWord(word, inModule) {
  return isStrictReservedWord(word, inModule) || isStrictBindOnlyReservedWord(word)
}

export function isKeyword(word) {
  return keywords.has(word)
}
