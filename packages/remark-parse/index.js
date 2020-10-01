'use strict'

module.exports = parse

var fromMarkdown = require('mdast-util-from-markdown')

function parse(options) {
  var self = this

  this.Parser = parse

  function parse(doc) {
    var settings = Object.assign({}, self.data('settings'), options)
    // Note: these options are not in the readme.
    // The goal is for them to be set by plugins on `data` instead of being
    // passed by users.
    settings.extensions = settings.micromarkExtensions
    settings.mdastExtensions = settings.fromMarkdownExtensions
    return fromMarkdown(doc, settings)
  }
}
