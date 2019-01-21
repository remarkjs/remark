import unified = require('unified')
import * as Unist from 'unist'
import remarkParse = require('remark-parse')

const parseOptions: Partial<remarkParse.RemarkParseOptions> = {
  gfm: true,
  pedantic: true
}

unified().use(remarkParse, parseOptions)

const badParseOptions: Partial<remarkParse.RemarkParseOptions> = {
  // $ExpectError
  gfm: 'true'
}
