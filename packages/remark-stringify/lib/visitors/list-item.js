/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:visitors:list-item
 * @fileoverview Stringify a list item.
 */

/* Dependencies. */
import repeat from 'repeat-string';
import pad from '../util/pad';

/* Expose. */
export default listItem;

/* Which checkbox to use. */
const CHECKBOX_MAP = {
  undefined: '',
  null: '',
  true: '[x] ',
  false: '[ ] '
};

/**
 * Stringify a list item.
 *
 * Prefixes the content with a checked checkbox when
 * `checked: true`:
 *
 *     [x] foo
 *
 * Prefixes the content with an unchecked checkbox when
 * `checked: false`:
 *
 *     [ ] foo
 *
 * @param {Object} node - `listItem` node.
 * @param {Object} parent - `list` node.
 * @param {number} position - Index of `node` in `parent`.
 * @param {string} bullet - Bullet to use.  This, and the
 *   `listItemIndent` setting define the used indent.
 * @return {string} - Markdown list item.
 */
function listItem(node, parent, position, bullet) {
  const self = this;
  const style = self.options.listItemIndent;
  const loose = node.loose;
  const children = node.children;
  const length = children.length;
  const values = [];
  let index = -1;
  let value;
  let indent;
  let spacing;

  while (++index < length) {
    values[index] = self.visit(children[index], node);
  }

  value = CHECKBOX_MAP[node.checked] + values.join(loose ? '\n\n' : '\n');

  if (style === '1' || (style === 'mixed' && value.indexOf('\n') === -1)) {
    indent = bullet.length + 1;
    spacing = ' ';
  } else {
    indent = Math.ceil((bullet.length + 1) / 4) * 4;
    spacing = repeat(' ', indent - bullet.length);
  }

  value = bullet + spacing + pad(value, indent / 4).slice(indent);

  if (loose && parent.children.length - 1 !== position) {
    value += '\n';
  }

  return value;
}
