/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:macro:ordered-items
 * @fileoverview Stringify ordered list items.
 */

/* Expose. */
export default orderedItems;

/**
 * Visit ordered list items.
 *
 * Starts the list with
 * `node.start` and increments each following list item
 * bullet by one:
 *
 *     2. foo
 *     3. bar
 *
 * In `incrementListMarker: false` mode, does not increment
 * each marker and stays on `node.start`:
 *
 *     1. foo
 *     1. bar
 *
 * Adds an extra line after an item if it has
 * `loose: true`.
 *
 * @param {Object} node - `list` node with
 *   `ordered: true`.
 * @return {string} - Compiled children.
 */
function orderedItems(node) {
  const self = this;
  const fn = self.visitors.listItem;
  const increment = self.options.incrementListMarker;
  const values = [];
  const start = node.start;
  const children = node.children;
  const length = children.length;
  let index = -1;
  let bullet;

  while (++index < length) {
    bullet = (increment ? start + index : start) + '.';
    values[index] = fn.call(self, children[index], node, index, bullet);
  }

  return values.join('\n');
}
