// TypeScript Version: 3.0

declare module 'remark-parse' {
  import {MDParser, RemarkParseOptions} from 'remark-parse/types'
  import {Attacher} from 'unified'

  interface Parse extends Attacher {
    (options: RemarkParseOptions): void
    Parser: MDParser
  }
  const parse: Parse
  export = parse
}
