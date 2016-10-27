/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:util:match-tag-closing
 * @fileoverview Match an HTML closing tag.
 */

'use strict';

/* Dependencies. */
var alphabetical = require('is-alphabetical');
var decimal = require('is-decimal');
var whitespace = require('is-whitespace-character');

/* Expose. */
module.exports = match;

/* Constants. */
var C_LT = '<';
var C_GT = '>';
var C_SLASH = '/';

/**
 * Try to match a closing tag.
 *
 * @param {string} value - Value to parse.
 * @param {Array.<string>?} [blocks] - Known block tag-names,
 *   which must be matched if given.
 * @return {string?} - When applicable, the closing tag at
 *   the start of `value`.
 */
function match(value, blocks) {
  var index = 0;
  var length = value.length;
  var queue = '';
  var subqueue = '';
  var character;

  if (
    value.charAt(index) === C_LT &&
    value.charAt(++index) === C_SLASH
  ) {
    queue = C_LT + C_SLASH;
    subqueue = character = value.charAt(++index);

    if (!alphabetical(character)) {
      return;
    }

    index++;

    /* Eat as many alphabetic characters as
     * possible. */
    while (index < length) {
      character = value.charAt(index);

      if (!alphabetical(character) && !decimal(character)) {
        break;
      }

      subqueue += character;
      index++;
    }

    if (blocks && blocks.indexOf(subqueue.toLowerCase()) === -1) {
      return;
    }

    queue += subqueue;

    /* Eat white-space. */
    while (index < length) {
      character = value.charAt(index);

      if (!whitespace(character)) {
        break;
      }

      queue += character;
      index++;
    }

    if (value.charAt(index) === C_GT) {
      return queue + C_GT;
    }
  }
}
