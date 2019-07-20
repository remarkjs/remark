import remarkStringify = require('remark-stringify')
import unified = require('unified')
import {Node, Parent} from 'unist'

const inferredStringifyOptions = {
  gfm: true,
  fences: true,
  incrementListMarker: false
}

unified().use(remarkStringify, inferredStringifyOptions)

// These cannot be automatically inferred by TypeScript
const nonInferredStringifyOptions: Partial<
  remarkStringify.RemarkStringifyOptions
> = {
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

function gap(this: unified.Processor) {
  const Compiler = this.Compiler as typeof remarkStringify.Compiler
  const visitors = Compiler.prototype.visitors
  const original = visitors.heading

  visitors.heading = heading

  function heading(this: unified.Processor, node: Node, parent?: Parent) {
    // FIXME: remove need for explicit 'as' casting
    const headingNode = node as (Node & {depth: number})
    return (
      (headingNode.depth === 2 ? '\n' : '') +
      original.apply(this, [node, parent])
    )
  }
}

const plugin: unified.Attacher = gap
