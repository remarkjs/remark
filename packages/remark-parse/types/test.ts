import * as remarkParse from 'remark-parse'
import {RemarkParseOptions} from 'remark-parse/types'
import * as unified from 'unified'

const parseOptions: Partial<RemarkParseOptions> = {
  gfm: true,
  pedantic: true
}

unified().use(remarkParse, parseOptions)

const badParseOptions: Partial<RemarkParseOptions> = {
  // $ExpectError
  gfm: 'true'
}
remarkParse.Parser // $ExpectType MDParser
