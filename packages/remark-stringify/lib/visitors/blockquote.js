/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:visitors:blockquote
 * @fileoverview Stringify a blockquote.
 */

/* Expose. */
export default blockquote;

/**
 * Stringify a blockquote.
 *
 * @param {Object} node - `blockquote` node.
 * @return {string} - Markdown blockquote.
 */
function blockquote(node) {
  const values = this.block(node).split('\n');
  const result = [];
  const length = values.length;
  let index = -1;
  let value;

  while (++index < length) {
    value = values[index];
    result[index] = (value ? ' ' : '') + value;
  }

  return '>' + result.join('\n>');
}
