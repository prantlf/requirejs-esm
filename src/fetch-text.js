/* global require */

let fetchText

// Initialise the fetchText variable with a function to download
// from a URL or to read from the file system.
/* istanbul ignore if */
if (typeof window !== 'undefined' && window.navigator && window.document) {
  fetchText = (url, callback) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          callback(null, xhr.responseText)
        } else {
          callback(new Error(xhr.statusText))
        }
      }
    }
    xhr.send(null)
  }
} else {
  const { readFileSync } = require.nodeRequire ? require.nodeRequire('fs') : require('fs')
  fetchText = (path, callback) => {
    // Asynchronous reading is not possible during the build in the optimizer.
    try {
      callback(null, readFileSync(path, 'utf8'))
    } catch (error) {
      callback(error)
    }
  }
}

export default fetchText
