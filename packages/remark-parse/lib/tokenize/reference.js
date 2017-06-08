/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:tokenize:reference
 * @fileoverview Tokenise a reference.
 */

import whitespace from 'is-whitespace-character';
import locate from '../locate/link';
import normalize from '../util/normalize';

export default reference;
reference.locator = locate;

const T_LINK = 'link';
const T_IMAGE = 'image';
const T_FOOTNOTE = 'footnote';
const REFERENCE_TYPE_SHORTCUT = 'shortcut';
const REFERENCE_TYPE_COLLAPSED = 'collapsed';
const REFERENCE_TYPE_FULL = 'full';
const C_CARET = '^';
const C_BACKSLASH = '\\';
const C_BRACKET_OPEN = '[';
const C_BRACKET_CLOSE = ']';

/* Tokenise a reference. */
function reference(eat, value, silent) {
  const self = this;
  let character = value.charAt(0);
  let index = 0;
  const length = value.length;
  let subvalue = '';
  let intro = '';
  let type = T_LINK;
  let referenceType = REFERENCE_TYPE_SHORTCUT;
  let content;
  let identifier;
  let now;
  let node;
  let exit;
  let queue;
  let bracketed;
  let depth;

  /* Check whether we’re eating an image. */
  if (character === '!') {
    type = T_IMAGE;
    intro = character;
    character = value.charAt(++index);
  }

  if (character !== C_BRACKET_OPEN) {
    return;
  }

  index++;
  intro += character;
  queue = '';

  /* Check whether we’re eating a footnote. */
  if (
    self.options.footnotes &&
    type === T_LINK &&
    value.charAt(index) === C_CARET
  ) {
    intro += C_CARET;
    index++;
    type = T_FOOTNOTE;
  }

  /* Eat the text. */
  depth = 0;

  while (index < length) {
    character = value.charAt(index);

    if (character === C_BRACKET_OPEN) {
      bracketed = true;
      depth++;
    } else if (character === C_BRACKET_CLOSE) {
      if (!depth) {
        break;
      }

      depth--;
    }

    if (character === C_BACKSLASH) {
      queue += C_BACKSLASH;
      character = value.charAt(++index);
    }

    queue += character;
    index++;
  }

  subvalue = queue;
  content = queue;
  character = value.charAt(index);

  if (character !== C_BRACKET_CLOSE) {
    return;
  }

  index++;
  subvalue += character;
  queue = '';

  while (index < length) {
    character = value.charAt(index);

    if (!whitespace(character)) {
      break;
    }

    queue += character;
    index++;
  }

  character = value.charAt(index);

  if (character === C_BRACKET_OPEN) {
    identifier = '';
    queue += character;
    index++;

    while (index < length) {
      character = value.charAt(index);

      if (character === C_BRACKET_OPEN || character === C_BRACKET_CLOSE) {
        break;
      }

      if (character === C_BACKSLASH) {
        identifier += C_BACKSLASH;
        character = value.charAt(++index);
      }

      identifier += character;
      index++;
    }

    character = value.charAt(index);

    if (character === C_BRACKET_CLOSE) {
      referenceType = identifier ? REFERENCE_TYPE_FULL : REFERENCE_TYPE_COLLAPSED;
      queue += identifier + character;
      index++;
    } else {
      identifier = '';
    }

    subvalue += queue;
    queue = '';
  } else {
    if (!content) {
      return;
    }

    identifier = content;
  }

  /* Brackets cannot be inside the identifier. */
  if (referenceType !== REFERENCE_TYPE_FULL && bracketed) {
    return;
  }

  /* Inline footnotes cannot have an identifier. */
  if (type === T_FOOTNOTE && referenceType !== REFERENCE_TYPE_SHORTCUT) {
    type = T_LINK;
    intro = C_BRACKET_OPEN + C_CARET;
    content = C_CARET + content;
  }

  subvalue = intro + subvalue;

  if (type === T_LINK && self.inLink) {
    return null;
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true;
  }

  if (type === T_FOOTNOTE && content.indexOf(' ') !== -1) {
    return eat(subvalue)({
      type: 'footnote',
      children: this.tokenizeInline(content, eat.now())
    });
  }

  now = eat.now();
  now.column += intro.length;
  now.offset += intro.length;
  identifier = referenceType === REFERENCE_TYPE_FULL ? identifier : content;

  node = {
    type: type + 'Reference',
    identifier: normalize(identifier)
  };

  if (type === T_LINK || type === T_IMAGE) {
    node.referenceType = referenceType;
  }

  if (type === T_LINK) {
    exit = self.enterLink();
    node.children = self.tokenizeInline(content, now);
    exit();
  } else if (type === T_IMAGE) {
    node.alt = self.decode.raw(self.unescape(content), now) || null;
  }

  return eat(subvalue)(node);
}
