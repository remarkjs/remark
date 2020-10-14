import remarkStringify = require('remark-stringify')
import unified = require('unified')

import {Node, Parent} from 'unist'

const inferredStringifyOptions = {
  gfm: true,
  fences: true,
  incrementListMarker: false
}

unified().use(remarkStringify)
unified().use(remarkStringify, inferredStringifyOptions)

// These cannot be automatically inferred by TypeScript
const nonInferredStringifyOptions: remarkStringify.RemarkStringifyOptions = {
  fence: '~',
  bullet: '+',
  listItemIndent: 'tab',
  rule: '-',
  strong: '_',
  emphasis: '*'
}

unified().use(remarkStringify, nonInferredStringifyOptions)

const badStringifyOptions = {
  gfm: 'true'
}

// $ExpectError
unified().use(remarkStringify, badStringifyOptions)

const incompleteStringifyOptions: remarkStringify.RemarkStringifyOptions = {
  fences: true,
  incrementListMarker: false
}
