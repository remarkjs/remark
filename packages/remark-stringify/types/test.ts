import remarkStringify = require('remark-stringify')
import unified = require('unified')

const stringifyOptions: Partial<remarkStringify.RemarkStringifyOptions> = {
  gfm: true,
  bullet: '*',
  fences: true,
  fence: '`',
  incrementListMarker: false
}

unified().use(remarkStringify, stringifyOptions)

const badStringifyOptions: Partial<remarkStringify.RemarkStringifyOptions> = {
  // $ExpectError
  gfm: 'true'
}
