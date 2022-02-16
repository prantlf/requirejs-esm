let skipModules = []

export function setSkipModules(names) {
  skipModules = names
}

// Checks if a module name is included in the list of modules to skip
// the transformation.
export function skipModule(name) {
  for (const skipModule of skipModules) {
    // Recognise an asterisk at the beginning
    if (skipModule.startsWith('*')) {
      if (name.indexOf(skipModule.substring(1)) >= 0) return true
    }
    // Accept a path prefix as well.
    else if (name.startsWith(skipModule)) return true
  }
}
