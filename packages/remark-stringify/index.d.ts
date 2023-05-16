// This wrapper exists because JS in TS can’t export a `@type` of a function.
import type {Root} from 'mdast'
import type {Plugin} from 'unified'
import type {Options} from './lib/index.js'

declare const remarkStringify: Plugin<[(Options | undefined)?], Root, string>
export default remarkStringify

export type {Options} from './lib/index.js'
