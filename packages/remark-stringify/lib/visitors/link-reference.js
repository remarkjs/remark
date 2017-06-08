/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:visitors:link-reference
 * @fileoverview Stringify a link reference.
 */

/* Dependencies. */
import copy from '../util/copy-identifier-encoding';
import label from '../util/label';

/* Expose. */
export default linkReference;

/**
 * Stringify a link reference.
 *
 * @param {Object} node - `linkReference` node.
 * @return {string} - Markdown link reference.
 */
function linkReference(node) {
  const self = this;
  const type = node.referenceType;
  const exit = self.enterLinkReference(self, node);
  let value = self.all(node).join('');

  exit();

  if (type === 'shortcut' || type === 'collapsed') {
    value = copy(value, node.identifier);
  }

  return '[' + value + ']' + label(node);
}
