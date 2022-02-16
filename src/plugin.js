/* global module */

import fetchText from './fetch-text'
import writeText from './write-text'
import { setSkipModules, skipModule } from './skip-module'
import transformSource from './transform'

const {
  // Allow using a different plugin alias than `esm` in the source code.
  pluginName,
  // Assume that the original sources are JavaScript files by default.
  fileExtension = '.js',
  // Flags to enforce or suppress the transpilation of not yet defined modules.
  mixedAmdAndEsm,
  onlyAmd,
  // List of module names not to check and transform.
  skipModules = [],
  // Method to update paths of module dependencies, to prefix JavaScript module
  // name with `esm!`, above all.
  resolvePath,
  // ecmaVersion,
  // Boolean or object with booleans { inline, content }.
  sourceMap,
  // Enable console logging.
  verbose,
  // Directory to save a copy of the transformed modules.
  debugDir
} = typeof module !== 'undefined' && module.config && module.config() || {}

const buildMap = {}

setSkipModules(skipModules)

//>>excludeEnd('excludeEsm')
export default {
  load(name, req, onload, reqConfig) {
    verbose && console.log('esm: loading', name)
    // If the module has been already defined from a module bundle, it was
    // already transpiled, when the output bundle was written. No need to
    // re-transpile it. This can happen only during the runtime.
    //
    // The re-transpilation is however necessary, if a testing page or a unit
    // test loads source ESM modules with extensions, which are going to be
    // consumed by a bundled module. Then the bundled module has to prefix
    // each of its dependencies with `esm!` to ensure their transpilation.
    // This mixed mode can to be enabled by the flag `mixedAmdAndEsm`, if needed.
    //
    // If the whole application is transpiled, there is no need to transpile
    // ESM modules or prefix dependencies of AMD modules. Even not yet defined
    // modules can be loaded just by `require` to get better performance.
    if (!mixedAmdAndEsm && !reqConfig.isBuild && req.specified(name) ||
        onlyAmd || skipModule(name)) {
      verbose && console.log('esm: delegating', name)
      return req([name], onload, onload.error)
    }
//>>excludeStart('excludeEsm', pragmas.excludeEsm)

    // Paths relative to the current directory include the file extension.
    // Otherwise the file extension must not be used for JavaScript modules.
    // The file name should include the orioginal extension in the source maps.
    const file = name.endsWith(fileExtension) ? name : name + fileExtension
    // Compilation and bundling of module sub-trees can be skipped, if those
    // are mapped to the pseudo-path `empty:`, meaning that those modules
    // are external and will be loaded during the runtime.
    const url = req.toUrl(file)
    if (url.startsWith('empty:')) {
      verbose && console.log('esm: skipping', name, 'mapped to', url)
      return onload()
    }

    // Fetch the text of the source module by AJAX and transpile it.
    verbose && console.log('esm: fetching', name, 'mapped to', url)
    fetchText(url, async (error, text) => {
      if (error) {
        verbose && console.log('esm: missing', name)
        return onload.error(error)
      }

      let code, updated
      try {
        verbose && console.log('esm: transforming', name);
        ({ code, updated } = transformSource(text, file, {
          pluginName,
          resolvePath,
          /*ecmaVersion,*/
          // Always produce the source maps when transpiling in the browser, otherwise
          // the debugging would me impossible. When building and bundling, check if
          // the source maps were enabled for the output.
          sourceMap: sourceMap || !reqConfig.isBuild
        }))
        if (!updated) {
          verbose && console.log('esm: retaining', name)
          // return req([name], onload, onload.error)
        } else if (reqConfig.isBuild && debugDir) {
          writeText(`${debugDir}/${file}`, code)
        }
      } catch (error) {
        // RequireJS did not always log this error.
        console.error(`Transforming "${name}" (resolved to "${url}") failed:`)
        console.error(error)
        return onload.error(error)
      }

      // Remember the transpiled content for the writing phase during the build.
      if (reqConfig.isBuild) {
        buildMap[name] = code
      }

      verbose && console.log('esm: returning', name)
      onload.fromText(code)
    })
  },

  write(pluginName, moduleName, write) {
    const code = buildMap[moduleName]
    if (code) {
      // Add the transpiled module under the original name. Earlier modules
      // refer it with that name, before the module was converted to ESM.
      write.asModule(moduleName, code)
      // Add a stub of the module with the name prefixed by `esm!`. Modules
      // compiled with esm refer it with that name and this stub will simplify
      // the module loading by skipping the plugin evaluation.
      write.asModule(`${pluginName}!${moduleName}`,
        '\ndefine([\'' + moduleName + '\'], res => res);\n')
    }
//>>excludeEnd('excludeEsm')
  }
}
