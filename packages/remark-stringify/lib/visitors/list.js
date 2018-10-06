'use strict';

module.exports = list;

/* Which method to use based on `list.ordered`. */
var ORDERED_MAP = {
  true: 'visitOrderedItems',
  false: 'visitUnorderedItems'
};

function list(node) {
  var ordered = node.ordered;
  return this[ORDERED_MAP[ordered == null ? false : ordered]](node);
}
