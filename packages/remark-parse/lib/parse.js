'use strict'

var xtend = require('xtend')
var removePosition = require('unist-util-remove-position')

module.exports = parse

var lineFeed = '\n'
var tab = '\t'
var lineBreaksExpression = /\r\n|\r/g

// Parse the bound file.
function parse() {
  var self = this
  var value = String(self.file)
  var start = {line: 1, column: 1, offset: 0}
  var content = xtend(start)
  var node

  // Clean non-unix newlines: `\r\n` and `\r` are all changed to `\n`.
  // This should not affect positional information.
  value = value.replace(lineBreaksExpression, lineFeed)
  
  value = cleanLeadingTabs(value);

  // BOM.
  if (value.charCodeAt(0) === 0xfeff) {
    value = value.slice(1)

    content.column++
    content.offset++
  }

  node = {
    type: 'root',
    children: self.tokenizeBlock(value, content),
    position: {start: start, end: self.eof || xtend(start)}
  }

  if (!self.options.position) {
    removePosition(node, true)
  }

  return node
}

// Replace any leading tabs on a newline with spaces.
// This should not affect positional information.
function cleanLeadingTabs(value) {
  var occurence = value.indexOf(lineFeed + tab);
  while (occurence != -1) {
    var startOfTabs = occurence + 1;
    var endOfTabs = occurence + 2;
    var replacementString = "  ";

    // Find ALL leading tabs
    while (value.substring(endOfTabs, endOfTabs + 1) == '\t') {
      endOfTabs += 1;
      replacementString += "  ";
    }

    // Replace tabs with spaces and start search over.
    value = value.substr(0, startOfTabs) + replacementString + value.substr(endOfTabs);
    occurence = value.indexOf(lineFeed + tab, occurence + 1)
  }
  
  return value;
}