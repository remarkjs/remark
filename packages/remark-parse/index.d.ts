// This wrapper exists because JS in TS can’t export a `@type` of a function.
import type {Options} from './lib/index.js'
import type {Root} from 'mdast'
import type {Plugin} from 'unified'
declare const remarkParse: Plugin<[Options?] | void[], string, Root>
export default remarkParse
export type {Options}
