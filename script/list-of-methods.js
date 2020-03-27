'use strict'

var zone = require('mdast-zone')
var u = require('unist-builder')
var proto = require('../packages/remark-parse').Parser.prototype

module.exports = listOfMethods

function listOfMethods() {
  return transformer
}

function transformer(tree) {
  zone(tree, 'methods-block', replace('blockMethods'))
  zone(tree, 'methods-inline', replace('inlineMethods'))
}

function replace(name) {
  var list = proto[name]

  return replace

  function replace(start, nodes, end) {
    return [
      start,
      u(
        'list',
        {ordered: false},
        list.map(function (name) {
          return u('listItem', [u('paragraph', [u('inlineCode', name)])])
        })
      ),
      end
    ]
  }
}
