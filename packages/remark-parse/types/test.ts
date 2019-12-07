import unified = require('unified')
import remarkParse = require('remark-parse')

const partialParseOptions: remarkParse.PartialRemarkParseOptions = {
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

// $ExpectError
const parseOptions: remarkParse.RemarkParseOptions = {
  gfm: true,
  pedantic: true
}

const badParseOptionsInterface: remarkParse.PartialRemarkParseOptions = {
  // $ExpectError
  gfm: 'true'
}
