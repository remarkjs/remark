'use strict';

var repeat = require('repeat-string');
var pad = require('../util/pad');

module.exports = listItem;

/* Stringify a list item.
 *
 * Prefixes the content with a checked checkbox when
 * `checked: true`:
 *
 *     [x] foo
 *
 * Prefixes the content with an unchecked checkbox when
 * `checked: false`:
 *
 *     [ ] foo
 */
function listItem(node, parent, position, bullet) {
  var self = this;
  var style = self.options.listItemIndent;
  var marker = bullet || self.options.bullet;
  var spread = node.spread == null ? true : node.spread;
  var checked = node.checked;
  var children = node.children;
  var length = children.length;
  var values = [];
  var index = -1;
  var value;
  var indent;
  var spacing;

  while (++index < length) {
    values[index] = self.visit(children[index], node);
  }

  value = values.join(spread ? '\n\n' : '\n');

  if (typeof checked === 'boolean') {
    // Note: I’d like to be able to only add the space between the check and
    // the value, but unfortunately github does not support empty list-items
    // with a checkbox :(
    value = '[' + (checked ? 'x' : ' ') + '] ' + value;
  }

  if (style === '1' || (style === 'mixed' && value.indexOf('\n') === -1)) {
    indent = marker.length + 1;
    spacing = ' ';
  } else {
    indent = Math.ceil((marker.length + 1) / 4) * 4;
    spacing = repeat(' ', indent - marker.length);
  }

  return value ? marker + spacing + pad(value, indent / 4).slice(indent) : marker;
}
