let skipModules = []

export function setSkipModules(names) {
  skipModules = names
}

// Checks if a module name is included in the list of modules to skip
// the transformation.
export function skipModule(name) {
  for (const skipModule of skipModules) {
    // Accept a path prefix as well.
    if (name.startsWith(skipModule)) return true
  }
}
