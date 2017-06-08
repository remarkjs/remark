/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:tokenize:break
 * @fileoverview Tokenise a break.
 */

const locate = require('../locate/break');

export default hardBreak;
hardBreak.locator = locate;

const MIN_BREAK_LENGTH = 2;

/* Tokenise a break. */
function hardBreak(eat, value, silent) {
  const self = this;
  const breaks = self.options.breaks;
  const length = value.length;
  let index = -1;
  let queue = '';
  let character;

  while (++index < length) {
    character = value.charAt(index);

    if (character === '\n') {
      if (!breaks && index < MIN_BREAK_LENGTH) {
        return;
      }

      /* istanbul ignore if - never used (yet) */
      if (silent) {
        return true;
      }

      queue += character;

      return eat(queue)({type: 'break'});
    }

    if (character !== ' ') {
      return;
    }

    queue += character;
  }
}
