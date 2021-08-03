// This wrapper exists because JS in TS can’t export a `@type` of a function.
import type {Options} from './lib/index.js'
import type {Root} from 'mdast'
import type {Plugin} from 'unified'
declare const remarkStringify: Plugin<[Options?] | void[], Root, string>
export default remarkStringify
export type {Options}
