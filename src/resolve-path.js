// Returns the parent directory by cutting the file name after the last slash,
// leaving the slash in the result. If there is no slash in the path - the path
// is just a file name, it will return `undefined`.
function parentDir (path) {
  const lastSlash = path.lastIndexOf('/')
  return lastSlash > 0 ? path.substring(0, lastSlash + 1) : undefined
}

// Trims the leading "./" off the path.
function shortenPath(path) {
  while (path.charAt(0) === '.' && path.charAt(1) === '/') {
    path = path.substring(2)
  }
  return path
}

// Checks if the path starts with "../".
function pointsToParent(path) {
  return path.charAt(0) === '.' && path.charAt(1) === '.' && path.charAt(2) === '/'
}

// Joins two paths together and avoids leaving "/./" or "/../" in the middle.
function joinPath (first, second) {
  // If the second part starts with "./", it can be safely removed.
  second = shortenPath(second)
  // The parent path can be undefined, if the file is located in the current directory.
  if (first !== undefined) {
    // As long as "../" can be removed from the second path, shorten the first one.
    while (pointsToParent(second)) {
      // Remove the leading "../" and trim futher all leading "./".
      second = shortenPath(second.substring(3))
      // Cut the last directory from the first path.
      first = parentDir(first)
      // If the last part of the first path was removed and there is no parent
      // directory to go further, return the rest of the second path.
      if (first === undefined) {
        return second
      }
    }
    // Return what remains from the first path concatenated with the second one.
    second = first + second
  }
  return second
}

// Ensures that every JavaScript dependency will be prefixed by `esm!`.
// Relative paths will be converted to be relative to the parent module.
export default function resolvePath (sourcePath, currentFile, { pluginName }) {
  // Ignore paths with other plugins applied and the three built-in
  // pseudo-modules of RequireJS.
  if (!pluginName || sourcePath.includes('!') || sourcePath === 'require' ||
      sourcePath === 'module' || sourcePath === 'exports') return

  // If `sourcePath` is relative to `currentFile` - starts with ./ or ../ -
  // prepend the parent directory of `currentFile` to it. This was needed
  // for modules located outside the source root (`baseUrl`), which were
  // mapped there using the `paths` of `map` configuration properties.
  if (sourcePath.charAt(0) === '.' && (sourcePath.charAt(1) === '/' ||
      sourcePath.charAt(1) === '.' && sourcePath.charAt(2) === '/')) {
    sourcePath = joinPath(parentDir(currentFile), sourcePath)
  }
  return `${pluginName}!${sourcePath}`
}
