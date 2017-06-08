/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:visitors:strong
 * @fileoverview Stringify a strong.
 */

/* Dependencies. */
import repeat from 'repeat-string';

/* Expose. */
export default strong;

/**
 * Stringify a `strong`.
 *
 * The marker used is configurable by `strong`, which
 * defaults to an asterisk (`'*'`) but also accepts an
 * underscore (`'_'`):
 *
 *     __foo__
 *
 * @param {Object} node - `strong` node.
 * @return {string} - Markdown strong.
 */
function strong(node) {
  const marker = repeat(this.options.strong, 2);
  return marker + this.all(node).join('') + marker;
}
