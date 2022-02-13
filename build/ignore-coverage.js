const { createFilter } = require('@rollup/pluginutils')
const MagicString = require('magic-string')

module.exports = function ignoreCoverage({
  include = ['**/*.js'],
  exclude,
  root = process.cwd(),
  prefix = 'node_modules/',
  sourcemap = true,
  verbose = false
} = {}) {
  const filter = createFilter(include, exclude)
  const rootLength = root.length + 1

  return {
    name: 'ignore-coverage',

    transform(code, id) {
      if (!filter(id)) return

      if (id.startsWith(root)) id = id.substring(rootLength)
      if (!Array.isArray(prefix)) prefix = [prefix]
      if (!prefix.some(prefix => id.startsWith(prefix))) return

      if (verbose) console.log(`Ignore coverage of "${id}".`)

      const separator = code.endsWith('\n') ? '' : '\n'
      const prolog = '/* c8 ignore start */\n'
      const epilog = `${separator}/* c8 ignore stop */\n`

      if (!sourcemap)
        return {
          code: `${prolog}${code}${epilog}`,
          map: { mappings: '' }
        }

      const magicString = new MagicString(code)
      magicString.prepend(prolog)
      magicString.append(epilog)

      return {
        code: magicString.toString(),
        map: magicString.generateMap({ includeContent: true, hires: true })
      }
    }
  }
}
