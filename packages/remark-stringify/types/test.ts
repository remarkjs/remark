import remarkStringify = require('remark-stringify')
import unified = require('unified')
import {Node, Parent} from 'unist'

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

function gap(this: unified.Processor) {
  const Compiler = this.Compiler as typeof remarkStringify.Compiler
  const visitors = Compiler.prototype.visitors
  const original = visitors.heading

  visitors.heading = heading

  function heading(this: unified.Processor, node: Node, parent?: Parent) {
    return (node.depth === 2 ? '\n' : '') + original.apply(this, [node, parent])
  }
}

const plugin: unified.Attacher = gap
