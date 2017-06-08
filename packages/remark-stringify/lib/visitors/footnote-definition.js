/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:visitors:footnote-definition
 * @fileoverview Stringify a footnote-definition.
 */

/* Dependencies. */
import repeat from 'repeat-string';

/* Expose. */
export default footnoteDefinition;

/**
 * Stringify a footnote definition.
 *
 * @param {Object} node - `footnoteDefinition` node.
 * @return {string} - Markdown footnote definition.
 */
function footnoteDefinition(node) {
  const id = node.identifier.toLowerCase();
  const content = this.all(node).join('\n\n' + repeat(' ', 4));

  return '[^' + id + ']: ' + content;
}
