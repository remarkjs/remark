/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:visitors:yaml
 * @fileoverview Stringify yaml.
 */

/* Dependencies. */
import repeat from 'repeat-string';

/* Expose. */
export default yaml;

/**
 * Stringify `yaml`.
 *
 * @param {Object} node - `yaml` node.
 * @return {string} - Markdown yaml.
 */
function yaml(node) {
  const marker = repeat('-', 3);
  return marker + (node.value ? '\n' + node.value : '') + '\n' + marker;
}
