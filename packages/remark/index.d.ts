/// <reference types="remark-parse" />
/// <reference types="remark-stringify" />

import type {Root} from 'mdast'
import type {Processor} from 'unified'

/**
 * Create a new unified processor that already uses `remark-parse` and
 * `remark-stringify`.
 */
export const remark: Processor<Root, undefined, undefined, Root, string>
