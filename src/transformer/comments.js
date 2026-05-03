// Check if one of the first 10 lines shorter than 100 characters contains
// "// requirejs-esm-skip-file" or // requirejs-esm-process-file".
export function processOrSkipByComment(text) {
  for (let start = 0, i = 0; i < 10; ++i) {
    const endLine = text.indexOf('\n', start)
    if (endLine < 0 || endLine > 100) break
    const line = text.substring(start, endLine)
    const comment = /^\s*\/\//.test(line)
    if (!comment) break
    const directive = /^\s*\/\/\s*requirejs-esm-(skip|process)-file\s*$/.exec(line)
    if (directive) {
      return directive[1] === 'process'
    }
    start = endLine + 1
  }
}
