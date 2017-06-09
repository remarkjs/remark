/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:visitors:emphasis
 * @fileoverview Stringify a emphasis.
 */

/* Expose. */
export default emphasis;

/**
 * Stringify a `emphasis`.
 *
 * The marker used is configurable through `emphasis`, which
 * defaults to an underscore (`'_'`) but also accepts an
 * asterisk (`'*'`):
 *
 *     *foo*
 *
 * @param {Object} node - `emphasis` node.
 * @return {string} - Markdown emphasis.
 */
function emphasis(node) {
  const marker = this.options.emphasis;
  return marker + this.all(node).join('') + marker;
}
