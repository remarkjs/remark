/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:visitors:heading
 * @fileoverview Stringify a heading.
 */

/* Dependencies. */
import repeat from 'repeat-string';

/* Expose. */
export default heading;

/**
 * Stringify heading.
 *
 * In `setext: true` mode and when `depth` is smaller than
 * three, creates a setext header:
 *
 *     Foo
 *     ===
 *
 * Otherwise, an ATX header is generated:
 *
 *     ### Foo
 *
 * In `closeAtx: true` mode, the header is closed with
 * hashes:
 *
 *     ### Foo ###
 *
 * @param {Object} node - `heading` node.
 * @return {string} - Markdown heading.
 */
function heading(node) {
  const self = this;
  const depth = node.depth;
  const setext = self.options.setext;
  const closeAtx = self.options.closeAtx;
  const content = self.all(node).join('');
  let prefix;

  if (setext && depth < 3) {
    return content + '\n' + repeat(depth === 1 ? '=' : '-', content.length);
  }

  prefix = repeat('#', node.depth);

  return prefix + ' ' + content + (closeAtx ? ' ' + prefix : '');
}
