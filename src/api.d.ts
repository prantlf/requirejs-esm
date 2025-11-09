type NeedsResolve = (sourcePath: string, currentFile: string) => boolean

interface ResolveOptions {
  pluginName?: string
  needsResolve?: NeedsResolve
}

declare function resolvePath(sourcePath: string, currentFile: string, options?: ResolveOptions): string

type ResolvePath = ((sourcePath: string, currentFile: string, options?: ResolveOptions) => string) | false

interface TransformAstOptions {
  pluginName?: string /*= 'esm'' */
  resolvePath?: ResolvePath
  useStrict?: boolean /*= true */
}

interface TransformOptions extends TransformAstOptions {
  sourceMap?: boolean /*= true */
}

declare function transform(contents: string, path: string, options?: TransformOptions): string

declare function transformAst(ast: object, options?: TransformOptions): { amd?: true, updated?: true }

declare function detectDefinesOrRequires(ast: object): {
  namespace?: object
  func: object
  name?: object
  deps?: object
  params?: object[]
  factory?: object
  output?: object
  body?: object
}[]

declare function detectImportsAndExports(ast: object): {
  imports: {
    node: object
    source: string
    local?: string
    specifiers?: { imported: string, local: string }[]
    export?: true
  }[]
  exports: {
    node: object,
    default?: true
    import?: true
  }[]
}
