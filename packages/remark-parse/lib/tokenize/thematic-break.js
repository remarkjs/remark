/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:tokenize:thematic-break
 * @fileoverview Tokenise a thematic break.
 */

export default thematicBreak;

const C_NEWLINE = '\n';
const C_TAB = '\t';
const C_SPACE = ' ';
const C_ASTERISK = '*';
const C_UNDERSCORE = '_';
const C_DASH = '-';

const THEMATIC_BREAK_MARKER_COUNT = 3;

/* Tokenise a thematic break. */
function thematicBreak(eat, value, silent) {
  let index = -1;
  const length = value.length + 1;
  let subvalue = '';
  let character;
  let marker;
  let markerCount;
  let queue;

  while (++index < length) {
    character = value.charAt(index);

    if (character !== C_TAB && character !== C_SPACE) {
      break;
    }

    subvalue += character;
  }

  if (
    character !== C_ASTERISK &&
    character !== C_DASH &&
    character !== C_UNDERSCORE
  ) {
    return;
  }

  marker = character;
  subvalue += character;
  markerCount = 1;
  queue = '';

  while (++index < length) {
    character = value.charAt(index);

    if (character === marker) {
      markerCount++;
      subvalue += queue + marker;
      queue = '';
    } else if (character === C_SPACE) {
      queue += character;
    } else if (
      markerCount >= THEMATIC_BREAK_MARKER_COUNT &&
      (!character || character === C_NEWLINE)
    ) {
      subvalue += queue;

      if (silent) {
        return true;
      }

      return eat(subvalue)({type: 'thematicBreak'});
    } else {
      return;
    }
  }
}
