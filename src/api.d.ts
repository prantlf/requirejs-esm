type NeedsResolve = (sourcePath: string, currentFile: string) => boolean

interface ResolveOptions {
  pluginName?: string
  needsResolve?: NeedsResolve
}

declare function resolvePath(sourcePath: string, currentFile: string, options?: ResolveOptions): string

type ResolvePath = ((sourcePath: string, currentFile: string, options?: ResolveOptions) => string) | false

declare function transform(contents: string, path: string, options?: {
  pluginName?: string /*= 'esm'' */, resolvePath?: ResolvePath,
  sourceMap?: boolean /*= true */ }): string