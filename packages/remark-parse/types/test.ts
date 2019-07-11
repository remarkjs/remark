import unified = require('unified')
import * as Unist from 'unist'
import remarkParse = require('remark-parse')

const parseOptions = {
  gfm: true,
  pedantic: true
}

unified().use(remarkParse, parseOptions)

const badParseOptions = {
  gfm: 'true'
}

// $ExpectError
unified().use(remarkParse, badParseOptions)
