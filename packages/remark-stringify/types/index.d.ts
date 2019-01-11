// TypeScript Version: 3.0

declare module 'remark-stringify' {
  import {RemarkStringifyOptions} from 'remark-stringify/types'
  import {Attacher, Compiler, Processor} from 'unified'
  import {Node} from 'unist'

  interface Stringify extends Attacher {
    Compiler: Compiler
    (this: Processor, options?: Partial<RemarkStringifyOptions>): void
  }
  const stringify: Stringify
  export = stringify
}
