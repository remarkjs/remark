/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse
 * @fileoverview Markdown parser.
 */

import xtend from 'xtend';
import escapes from 'markdown-escapes';
import defaults from './defaults';

export default setOptions;

/* Set options. */
function setOptions(options) {
  const self = this;
  const current = self.options;
  let key;
  let value;

  if (options == null) {
    options = {};
  } else if (typeof options === 'object') {
    options = xtend(options);
  } else {
    throw new Error(
      'Invalid value `' + options + '` ' +
      'for setting `options`'
    );
  }

  for (key in defaults) {
    value = options[key];

    if (value == null) {
      value = current[key];
    }

    if (
      (key !== 'blocks' && typeof value !== 'boolean') ||
      (key === 'blocks' && typeof value !== 'object')
    ) {
      throw new Error(
        'Invalid value `' + value + '` ' +
        'for setting `options.' + key + '`'
      );
    }

    options[key] = value;
  }

  self.options = options;
  self.escape = escapes(options);

  return self;
}
