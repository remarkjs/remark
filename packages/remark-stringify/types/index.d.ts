// TypeScript Version: 3.0

import {Compiler, Plugin} from 'unified'
import {Options} from 'mdast-util-to-markdown'

declare namespace remarkStringify {
  interface Stringify extends Plugin<[RemarkStringifyOptions?]> {
    Compiler: Compiler
  }

  type RemarkStringifyOptions = Options
}

declare const remarkStringify: remarkStringify.Stringify

export = remarkStringify
