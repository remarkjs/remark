/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:util:label
 * @fileoverview Stringify a reference label.
 */

/* Expose. */
export default label;

/**
 * Stringify a reference label.
 *
 * Because link references are easily, mistakingly,
 * created (for example, `[foo]`), reference nodes have
 * an extra property depicting how it looked in the
 * original document, so stringification can cause minimal
 * changes.
 *
 * @param {Object} node - `linkReference` or
 *   `imageReference` node.
 * @return {string} - Markdown label reference.
 */
function label(node) {
  const type = node.referenceType;
  const value = type === 'full' ? node.identifier : '';

  return type === 'shortcut' ? value : '[' + value + ']';
}
