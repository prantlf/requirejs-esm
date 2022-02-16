/* global require */

let writeText

// Initialise the writeText variable with a function to write to a file.
/* istanbul ignore if */
if (!(typeof window !== 'undefined' && window.navigator && window.document)) {
  const { writeFileSync, mkdirSync } = require.nodeRequire ? require.nodeRequire('fs') : require('fs')
  const { dirname } = require.nodeRequire ? require.nodeRequire('path') : require('path')
  writeText = (path, content) => {
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, content)
  }
}

export default writeText
