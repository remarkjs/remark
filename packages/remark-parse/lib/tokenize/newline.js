/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:tokenize:newline
 * @fileoverview Tokenise a newline.
 */

import whitespace from 'is-whitespace-character';

export default newline;

/* Tokenise newline. */
function newline(eat, value, silent) {
  let character = value.charAt(0);
  let length;
  let subvalue;
  let queue;
  let index;

  if (character !== '\n') {
    return;
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true;
  }

  index = 1;
  length = value.length;
  subvalue = character;
  queue = '';

  while (index < length) {
    character = value.charAt(index);

    if (!whitespace(character)) {
      break;
    }

    queue += character;

    if (character === '\n') {
      subvalue += queue;
      queue = '';
    }

    index++;
  }

  eat(subvalue);
}
