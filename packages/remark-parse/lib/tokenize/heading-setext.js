/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:tokenize:heading-setext
 * @fileoverview Tokenise an setext-style heading.
 */

export default setextHeading;

const C_NEWLINE = '\n';
const C_TAB = '\t';
const C_SPACE = ' ';
const C_EQUALS = '=';
const C_DASH = '-';

const MAX_HEADING_INDENT = 3;

/* Map of characters which can be used to mark setext
 * headers, mapping to their corresponding depth. */
const SETEXT_MARKERS = {};

SETEXT_MARKERS[C_EQUALS] = 1;
SETEXT_MARKERS[C_DASH] = 2;

/* Tokenise an setext-style heading. */
function setextHeading(eat, value, silent) {
  const self = this;
  const now = eat.now();
  const length = value.length;
  let index = -1;
  let subvalue = '';
  let content;
  let queue;
  let character;
  let marker;
  let depth;

  /* Eat initial indentation. */
  while (++index < length) {
    character = value.charAt(index);

    if (character !== C_SPACE || index >= MAX_HEADING_INDENT) {
      index--;
      break;
    }

    subvalue += character;
  }

  /* Eat content. */
  content = '';
  queue = '';

  while (++index < length) {
    character = value.charAt(index);

    if (character === C_NEWLINE) {
      index--;
      break;
    }

    if (character === C_SPACE || character === C_TAB) {
      queue += character;
    } else {
      content += queue + character;
      queue = '';
    }
  }

  now.column += subvalue.length;
  now.offset += subvalue.length;
  subvalue += content + queue;

  /* Ensure the content is followed by a newline and a
   * valid marker. */
  character = value.charAt(++index);
  marker = value.charAt(++index);

  if (character !== C_NEWLINE || !SETEXT_MARKERS[marker]) {
    return;
  }

  subvalue += character;

  /* Eat Setext-line. */
  queue = marker;
  depth = SETEXT_MARKERS[marker];

  while (++index < length) {
    character = value.charAt(index);

    if (character !== marker) {
      if (character !== C_NEWLINE) {
        return;
      }

      index--;
      break;
    }

    queue += character;
  }

  if (silent) {
    return true;
  }

  return eat(subvalue + queue)({
    type: 'heading',
    depth,
    children: self.tokenizeInline(content, now)
  });
}
