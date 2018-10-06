'use strict';

module.exports = footnoteReference;

function footnoteReference(node) {
  return '[^' + (node.label || node.identifier) + ']';
}
