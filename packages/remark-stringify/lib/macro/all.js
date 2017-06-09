/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:macro:all
 * @fileoverview Stringify children in a node.
 */

/* Expose. */
export default all;

/**
 * Visit all children of `parent`.
 *
 * @param {Object} parent - Parent node of children.
 * @return {Array.<string>} - List of compiled children.
 */
function all(parent) {
  const self = this;
  const children = parent.children;
  const length = children.length;
  const results = [];
  let index = -1;

  while (++index < length) {
    results[index] = self.visit(children[index], parent);
  }

  return results;
}
