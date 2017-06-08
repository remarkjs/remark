/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:tokenize:strong
 * @fileoverview Tokenise strong.
 */

import trim from 'trim';
import whitespace from 'is-whitespace-character';
import locate from '../locate/strong';

export default strong;
strong.locator = locate;

const C_ASTERISK = '*';
const C_UNDERSCORE = '_';

/* Tokenise strong. */
function strong(eat, value, silent) {
  const self = this;
  let index = 0;
  let character = value.charAt(index);
  let now;
  let pedantic;
  let marker;
  let queue;
  let subvalue;
  let length;
  let prev;

  if (
    (character !== C_ASTERISK && character !== C_UNDERSCORE) ||
    value.charAt(++index) !== character
  ) {
    return;
  }

  pedantic = self.options.pedantic;
  marker = character;
  subvalue = marker + marker;
  length = value.length;
  index++;
  queue = '';
  character = '';

  if (pedantic && whitespace(value.charAt(index))) {
    return;
  }

  while (index < length) {
    prev = character;
    character = value.charAt(index);

    if (
      character === marker &&
      value.charAt(index + 1) === marker &&
      (!pedantic || !whitespace(prev))
    ) {
      character = value.charAt(index + 2);

      if (character !== marker) {
        if (!trim(queue)) {
          return;
        }

        /* istanbul ignore if - never used (yet) */
        if (silent) {
          return true;
        }

        now = eat.now();
        now.column += 2;
        now.offset += 2;

        return eat(subvalue + queue + subvalue)({
          type: 'strong',
          children: self.tokenizeInline(queue, now)
        });
      }
    }

    if (!pedantic && character === '\\') {
      queue += character;
      character = value.charAt(++index);
    }

    queue += character;
    index++;
  }
}
