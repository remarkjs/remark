/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:tokenize:url
 * @fileoverview Tokenise a URL.
 */

import decode from 'parse-entities';
import whitespace from 'is-whitespace-character';
import locate from '../locate/url';

export default url;
url.locator = locate;
url.notInLink = true;

const C_BRACKET_OPEN = '[';
const C_BRACKET_CLOSE = ']';
const C_PAREN_OPEN = '(';
const C_PAREN_CLOSE = ')';
const C_LT = '<';
const C_AT_SIGN = '@';

const HTTP_PROTOCOL = 'http://';
const HTTPS_PROTOCOL = 'https://';
const MAILTO_PROTOCOL = 'mailto:';

const PROTOCOLS = [
  HTTP_PROTOCOL,
  HTTPS_PROTOCOL,
  MAILTO_PROTOCOL
];

const PROTOCOLS_LENGTH = PROTOCOLS.length;

/* Tokenise a URL. */
function url(eat, value, silent) {
  const self = this;
  let subvalue;
  let content;
  let character;
  let index;
  let position;
  let protocol;
  let match;
  let length;
  let queue;
  let parenCount;
  let nextCharacter;
  let exit;

  if (!self.options.gfm) {
    return;
  }

  subvalue = '';
  index = -1;
  length = PROTOCOLS_LENGTH;

  while (++index < length) {
    protocol = PROTOCOLS[index];
    match = value.slice(0, protocol.length);

    if (match.toLowerCase() === protocol) {
      subvalue = match;
      break;
    }
  }

  if (!subvalue) {
    return;
  }

  index = subvalue.length;
  length = value.length;
  queue = '';
  parenCount = 0;

  while (index < length) {
    character = value.charAt(index);

    if (whitespace(character) || character === C_LT) {
      break;
    }

    if (
      character === '.' ||
      character === ',' ||
      character === ':' ||
      character === ';' ||
      character === '"' ||
      character === '\'' ||
      character === ')' ||
      character === ']'
    ) {
      nextCharacter = value.charAt(index + 1);

      if (!nextCharacter || whitespace(nextCharacter)) {
        break;
      }
    }

    if (character === C_PAREN_OPEN || character === C_BRACKET_OPEN) {
      parenCount++;
    }

    if (character === C_PAREN_CLOSE || character === C_BRACKET_CLOSE) {
      parenCount--;

      if (parenCount < 0) {
        break;
      }
    }

    queue += character;
    index++;
  }

  if (!queue) {
    return;
  }

  subvalue += queue;
  content = subvalue;

  if (protocol === MAILTO_PROTOCOL) {
    position = queue.indexOf(C_AT_SIGN);

    if (position === -1 || position === length - 1) {
      return;
    }

    content = content.substr(MAILTO_PROTOCOL.length);
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true;
  }

  exit = self.enterLink();
  content = self.tokenizeInline(content, eat.now());
  exit();

  return eat(subvalue)({
    type: 'link',
    title: null,
    url: decode(subvalue),
    children: content
  });
}
