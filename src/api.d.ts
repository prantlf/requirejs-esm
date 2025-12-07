type NeedsResolve = (sourcePath: string, currentFile: string) => boolean

interface ResolveOptions {
  pluginName?: string
  needsResolve?: NeedsResolve
}

declare function resolvePath(sourcePath: string, currentFile: string, options?: ResolveOptions): string

interface AmdOptions {
  namespace?: Record<string, unknown>
  func: Record<string, unknown>
  name: string
  deps?: string[]
  params?: string[]
  factory?: Record<string, unknown>
  output?: Record<string, unknown>
}

type ResolvePath = ((sourcePath: string, currentFile: string, options?: ResolveOptions) => string) | false
type OnBeforeTransform = (options: OnBeforeTransformOptions) => void
type OnAfterTransform = (options: OnAfterTransformOptions) => void
type OnBeforeUpdate = (options: AmdOptions) => boolean
type OnAfterUpdate = (options: AmdOptions) => boolean

interface TransformAstOptions {
  pluginName?: string /*= 'esm'' */
  resolvePath?: ResolvePath
  useStrict?: boolean /*= true */
  onBeforeTransform?: OnBeforeTransform
  onAfterTransform?: OnAfterTransform
  onBeforeUpdate?: OnBeforeUpdate
  onAfterUpdate?: OnAfterUpdate
}

interface TransformOptions extends TransformAstOptions {
  sourceMap?: boolean /*= true */
}

interface OnBeforeTransformOptions extends TransformAstOptions {
  program: Record<string, unknown>
}

interface OnAfterTransformOptions extends OnBeforeTransformOptions {
  callbackBody: Record<string, unknown>[]
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
