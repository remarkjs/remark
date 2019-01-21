// TypeScript Version: 3.0

import {Attacher, Compiler, Processor} from 'unified'
import {Node} from 'unist'

declare namespace remarkStringify {
  interface Stringify extends Attacher {
    Compiler: Compiler
    (this: Processor, options?: Partial<RemarkStringifyOptions>): void
  }

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
}

declare const remarkStringify: remarkStringify.Stringify

export = remarkStringify
