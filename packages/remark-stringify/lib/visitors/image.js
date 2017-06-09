/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:visitors:image
 * @fileoverview Stringify an image.
 */

/* Dependencies. */
import uri from '../util/enclose-uri';
import title from '../util/enclose-title';

/* Expose. */
export default image;

/**
 * Stringify an image.
 *
 * Is smart about enclosing `url` (see `encloseURI()`) and
 * `title` (see `encloseTitle()`).
 *
 *    ![foo](</fav icon.png> 'My "favourite" icon')
 *
 * Supports named entities in `url`, `alt`, and `title`
 * when in `settings.encode` mode.
 *
 * @param {Object} node - `image` node.
 * @return {string} - Markdown image.
 */
function image(node) {
  const self = this;
  let content = uri(self.encode(node.url || '', node));
  const exit = self.enterLink();
  const alt = self.encode(self.escape(node.alt || '', node));

  exit();

  if (node.title) {
    content += ' ' + title(self.encode(node.title, node));
  }

  return '![' + alt + '](' + content + ')';
}
