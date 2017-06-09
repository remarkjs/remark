/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:visitors:link
 * @fileoverview Stringify a link.
 */

/* Dependencies. */
import uri from '../util/enclose-uri';
import title from '../util/enclose-title';

/* Expose. */
export default link;

/* Expression for a protocol:
 * http://en.wikipedia.org/wiki/URI_scheme#Generic_syntax */
const PROTOCOL = /^[a-z][a-z+.-]+:\/?/i;

/**
 * Stringify a link.
 *
 * When no title exists, the compiled `children` equal
 * `url`, and `url` starts with a protocol, an auto
 * link is created:
 *
 *     <http://example.com>
 *
 * Otherwise, is smart about enclosing `url` (see
 * `encloseURI()`) and `title` (see `encloseTitle()`).
 *
 *    [foo](<foo at bar dot com> 'An "example" e-mail')
 *
 * Supports named entities in the `url` and `title` when
 * in `settings.encode` mode.
 *
 * @param {Object} node - `link` node.
 * @return {string} - Markdown link.
 */
function link(node) {
  const self = this;
  let content = self.encode(node.url || '', node);
  const exit = self.enterLink();
  const escaped = self.encode(self.escape(node.url || '', node));
  const value = self.all(node).join('');

  exit();

  if (
    node.title == null &&
    PROTOCOL.test(content) &&
    (escaped === value || escaped === 'mailto:' + value)
  ) {
    /* Backslash escapes do not work in autolinks,
     * so we do not escape. */
    return uri(self.encode(node.url), true);
  }

  content = uri(content);

  if (node.title) {
    content += ' ' + title(self.encode(self.escape(node.title, node), node));
  }

  return '[' + value + '](' + content + ')';
}
