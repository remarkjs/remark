// TypeScript Version: 3.0

declare module 'remark-parse/types' {
  import {Parser} from 'unified'
  import {Node, Position} from 'unist'

  interface RemarkParseOptions {
    gfm: boolean
    commonmark: boolean
    footnotes: boolean
    pedantic: boolean
  }
  interface Add {
    (n: Node, parent?: Node): Node
    test(): Position
    reset(n: Node, parent?: Node): Node
  }

  type Eat = (value: string) => Add

  type Locator = (value: string, fromIndex: number) => number

  interface Tokenizer {
    (e: Eat, value: string, silent: true): boolean
    (e: Eat, value: string): Node
    locator: Locator
    onlyAtStart: boolean
    notInBlock: boolean
    notInList: boolean
    notInLink: boolean
  }

  class MDParser extends Parser {
    blockMethods: string[]
    inlineTokenizers: {
      [k: string]: Tokenizer
    }
  }
}

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
