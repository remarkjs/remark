// TypeScript Version: 3.0

import {ParserFunction, Plugin} from 'unified'
import {Options} from 'mdast-util-from-markdown'

declare namespace remarkParse {
  interface Parse extends Plugin<[RemarkParseOptions?]> {
    Parser: ParserFunction
  }

  type RemarkParseOptions = Options
}

declare const remarkParse: remarkParse.Parse

export = remarkParse
