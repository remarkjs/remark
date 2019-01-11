import * as remarkStringify from 'remark-stringify'
import {RemarkStringifyOptions} from 'remark-stringify/types'
import * as unified from 'unified'

const stringifyOptions: Partial<RemarkStringifyOptions> = {
  gfm: true,
  bullet: '*',
  fences: true,
  fence: '`',
  incrementListMarker: false
}

unified().use(remarkStringify, stringifyOptions)

const badStringifyOptions: Partial<RemarkStringifyOptions> = {
  // $ExpectError
  gfm: 'true'
}
