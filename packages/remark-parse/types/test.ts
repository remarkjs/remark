import unified = require('unified')
import remarkParse = require('remark-parse')

const partialParseOptions: remarkParse.RemarkParseOptions = {
  gfm: true,
  pedantic: true
}

unified().use(remarkParse)
unified().use(remarkParse, partialParseOptions)

const badParseOptions = {
  gfm: 'true'
}

// $ExpectError
unified().use(remarkParse, badParseOptions)

const badParseOptionsInterface: remarkParse.RemarkParseOptions = {
  // $ExpectError
  gfm: 'true'
}
