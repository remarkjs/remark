// TypeScript Version: 3.0

import {CompilerFunction, Plugin} from 'unified'
import {Options} from 'mdast-util-to-markdown'

declare namespace remarkStringify {
  interface Stringify extends Plugin<[RemarkStringifyOptions?]> {
    Compiler: CompilerFunction
  }

  type RemarkStringifyOptions = Options
}

declare const remarkStringify: remarkStringify.Stringify

export = remarkStringify
