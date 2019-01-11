import {Parser} from 'unified'
import {Node, Position} from 'unist'

export interface RemarkParseOptions {
  gfm: boolean
  commonmark: boolean
  footnotes: boolean
  pedantic: boolean
}
export interface Add {
  (n: Node, parent?: Node): Node
  test(): Position
  reset(n: Node, parent?: Node): Node
}

export type Eat = (value: string) => Add

export type Locator = (value: string, fromIndex: number) => number

export interface Tokenizer {
  (e: Eat, value: string, silent: true): boolean
  (e: Eat, value: string): Node
  locator: Locator
  onlyAtStart: boolean
  notInBlock: boolean
  notInList: boolean
  notInLink: boolean
}

export class MDParser extends Parser {
  blockMethods: string[]
  inlineTokenizers: {
    [k: string]: Tokenizer
  }
}
