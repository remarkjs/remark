import unified = require('unified')
import remarkParse = require('remark-parse')

unified().use(remarkParse)

// $ExpectError
unified().use(remarkParse, {unknown: 1})
