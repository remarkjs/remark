import type {Root} from 'mdast'
import type {Plugin} from 'unified'
import type {Options} from './lib/index.js'

export type {Options} from './lib/index.js'

/**
 * Add support for serializing as HTML.
 *
 * @this
 *   Unified processor.
 * @param
 *   Configuration (optional).
 * @returns
 *   Nothing.
 */
declare const remarkStringify: Plugin<
  [(Readonly<Options> | null | undefined)?],
  Root,
  string
>
export default remarkStringify

// To do: register types.
// // Add custom settings supported when `remark-stringify` is added.
// declare module 'unified' {
//   interface Settings extends Options {}
// }
