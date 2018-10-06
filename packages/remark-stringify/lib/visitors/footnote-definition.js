'use strict';

var repeat = require('repeat-string');

module.exports = footnoteDefinition;

function footnoteDefinition(node) {
  var content = this.all(node).join('\n\n' + repeat(' ', 4));

  return '[^' + (node.label || node.identifier) + ']: ' + content;
}
