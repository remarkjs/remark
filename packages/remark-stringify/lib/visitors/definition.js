/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:visitors:definition
 * @fileoverview Stringify a definition.
 */

/* Dependencies. */
import uri from '../util/enclose-uri';
import title from '../util/enclose-title';

/* Expose. */
export default definition;

/**
 * Stringify an URL definition.
 *
 * Is smart about enclosing `url` (see `encloseURI()`) and
 * `title` (see `encloseTitle()`).
 *
 *    [foo]: <foo at bar dot com> 'An "example" e-mail'
 *
 * @param {Object} node - `definition` node.
 * @return {string} - Markdown definition.
 */
function definition(node) {
  let content = uri(node.url);

  if (node.title) {
    content += ' ' + title(node.title);
  }

  return '[' + node.identifier + ']: ' + content;
}
