/* global module */

import fetchText from './fetch-text'
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
  resolvePath
  // minify
  // ecmaVersion
} = typeof module !== 'undefined' && module.config && module.config() || {}

const buildMap = {}

setSkipModules(skipModules)

//>>excludeEnd('excludeEsm')
export default {
  load(name, req, onload, reqConfig) {
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
      return onload()
    }

    // Fetch the text of the source module by AJAX and transpile it.
    fetchText(url, async (error, text) => {
      if (error) {
        return onload.error(error)
      }

      let code
      try {
        // Always produce the source maps when transpiling in the browser, otherwise
        // the debugging would me impossible. When building and bundling, check if
        // the source maps were enabled for the output.
        const sourceMap = !reqConfig.isBuild || reqConfig.generateSourceMaps
        code = transformSource(text, file, { pluginName, resolvePath, /*ecmaVersion, minify,*/ sourceMap })
      } catch (error) {
        // RequireJS did not always log this error.
        console.log(`Transforming "${name}" (resolved to "${url}") failed:`)
        console.log(error)
        return onload.error(error)
      }

      // Remember the transpiled content for the writing phase during the build.
      if (reqConfig.isBuild) {
        buildMap[name] = code
      }

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
