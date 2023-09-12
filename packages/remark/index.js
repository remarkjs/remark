// Note: types exposed from `index.d.ts`
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import {unified} from 'unified'

/**
 * Create a new unified processor that already uses `remark-parse` and
 * `remark-stringify`.
 */
export const remark = unified().use(remarkParse).use(remarkStringify).freeze()
