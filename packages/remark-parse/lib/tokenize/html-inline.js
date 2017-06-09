/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:tokenize:html-inline
 * @fileoverview Tokenise inline HTML.
 */

import alphabetical from 'is-alphabetical';
import locate from '../locate/tag';
import {tag} from '../util/html';

export default inlineHTML;
inlineHTML.locator = locate;

const EXPRESSION_HTML_LINK_OPEN = /^<a /i;
const EXPRESSION_HTML_LINK_CLOSE = /^<\/a>/i;

/* Tokenise inline HTML. */
function inlineHTML(eat, value, silent) {
  const self = this;
  const length = value.length;
  let character;
  let subvalue;

  if (value.charAt(0) !== '<' || length < 3) {
    return;
  }

  character = value.charAt(1);

  if (
    !alphabetical(character) &&
    character !== '?' &&
    character !== '!' &&
    character !== '/'
  ) {
    return;
  }

  subvalue = value.match(tag);

  if (!subvalue) {
    return;
  }

  /* istanbul ignore if - not used yet. */
  if (silent) {
    return true;
  }

  subvalue = subvalue[0];

  if (!self.inLink && EXPRESSION_HTML_LINK_OPEN.test(subvalue)) {
    self.inLink = true;
  } else if (self.inLink && EXPRESSION_HTML_LINK_CLOSE.test(subvalue)) {
    self.inLink = false;
  }

  return eat(subvalue)({type: 'html', value: subvalue});
}
