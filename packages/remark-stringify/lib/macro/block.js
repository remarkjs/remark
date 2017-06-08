/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:macro:block
 * @fileoverview Stringify a block.
 */

/* Expose. */
export default block;

/**
 * Stringify a block node with block children (e.g., `root`
 * or `blockquote`).
 *
 * Knows about code following a list, or adjacent lists
 * with similar bullets, and places an extra newline
 * between them.
 *
 * @param {Object} node
 * @return {string} - Compiled children.
 */
function block(node) {
  const self = this;
  const values = [];
  const children = node.children;
  const length = children.length;
  let index = -1;
  let child;
  let prev;

  while (++index < length) {
    child = children[index];

    if (prev) {
      /* Duplicate nodes, such as a list
       * directly following another list,
       * often need multiple new lines.
       *
       * Additionally, code blocks following a list
       * might easily be mistaken for a paragraph
       * in the list itself. */
      if (child.type === prev.type && prev.type === 'list') {
        values.push(prev.ordered === child.ordered ? '\n\n\n' : '\n\n');
      } else if (prev.type === 'list' && child.type === 'code' && !child.lang) {
        values.push('\n\n\n');
      } else {
        values.push('\n\n');
      }
    }

    values.push(self.visit(child, node));

    prev = child;
  }

  return values.join('');
}
