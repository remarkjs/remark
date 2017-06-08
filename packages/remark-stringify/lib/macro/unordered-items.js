/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:macro:unordered-items
 * @fileoverview Stringify unordered list items.
 */

/* Expose. */
export default unorderedItems;

/**
 * Visit unordered list items.
 *
 * Uses `options.bullet` as each item's bullet.
 *
 * @param {Object} node - `list` node with
 *   `ordered: false`.
 * @return {string} - Compiled children.
 */
function unorderedItems(node) {
  const self = this;
  const bullet = self.options.bullet;
  const fn = self.visitors.listItem;
  const children = node.children;
  const length = children.length;
  let index = -1;
  const values = [];

  while (++index < length) {
    values[index] = fn.call(self, children[index], node, index, bullet);
  }

  return values.join('\n');
}
