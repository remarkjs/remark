import type {Root} from 'mdast'
import type {Plugin} from 'unified'
import type {Options} from './lib/index.js'

export type {Options} from './lib/index.js'

/**
 * Add support for parsing from markdown.
 *
 * @this
 *   Unified processor.
 * @param
 *   Configuration (optional).
 * @returns
 *   Nothing.
 */
declare const remarkParse: Plugin<
  [(Readonly<Options> | null | undefined)?],
  string,
  Root
>
export default remarkParse

// To do: register types.
// // Add custom settings supported when `remark-parse` is added.
// declare module 'unified' {
//   interface Settings extends Options {}
// }
