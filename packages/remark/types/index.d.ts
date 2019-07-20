// TypeScript Version: 3.0

import unified = require('unified')
import remarkParse = require('remark-parse')
import remarkStringify = require('remark-stringify')

type RemarkOptions = remarkParse.RemarkParseOptions &
  remarkStringify.RemarkStringifyOptions

declare function remark<
  P extends Partial<RemarkOptions> = Partial<RemarkOptions>
>(): unified.Processor<P>

export = remark
