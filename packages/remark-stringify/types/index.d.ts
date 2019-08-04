// TypeScript Version: 3.0

import {Compiler, Processor, Plugin} from 'unified'
import {Node, Parent} from 'unist'

declare class RemarkCompiler implements Compiler {
  compile(): string
  visitors: {
    [key: string]: remarkStringify.Visitor
  }
}

declare namespace remarkStringify {
  interface Stringify extends Plugin<[Partial<RemarkStringifyOptions>?]> {
    Compiler: typeof RemarkCompiler
    (this: Processor, options?: Partial<RemarkStringifyOptions>): void
  }

  type Compiler = RemarkCompiler

  interface RemarkStringifyOptions {
    gfm: boolean
    commonmark: boolean
    entities: boolean | 'numbers' | 'escape'
    setext: boolean
    closeAtx: boolean
    looseTable: boolean
    spacedTable: boolean
    paddedTable: boolean
    stringLength: (s: string) => number
    fence: '~' | '`'
    fences: boolean
    bullet: '-' | '*' | '+'
    listItemIndent: 'tab' | '1' | 'mixed'
    incrementListMarker: boolean
    rule: '-' | '_' | '*'
    ruleRepetition: number
    ruleSpaces: boolean
    strong: '_' | '*'
    emphasis: '_' | '*'
  }

  type Visitor = (node: Node, parent?: Parent) => string
}

declare const remarkStringify: remarkStringify.Stringify

export = remarkStringify
