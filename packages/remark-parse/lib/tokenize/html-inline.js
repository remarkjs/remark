/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:tokenize:html-inline
 * @fileoverview Tokenise inline HTML.
 */

'use strict';

var locate = require('../locate/tag');
var cdata = require('../util/match-cdata');
var comment = require('../util/match-comment');
var declaration = require('../util/match-declaration');
var instruction = require('../util/match-instruction');
var closing = require('../util/match-tag-closing');
var opening = require('../util/match-tag-opening');

module.exports = inlineHTML;
inlineHTML.locator = locate;

var EXPRESSION_HTML_LINK_OPEN = /^<a /i;
var EXPRESSION_HTML_LINK_CLOSE = /^<\/a>/i;

/* Tokenise inline HTML. */
function inlineHTML(eat, value, silent) {
  var self = this;
  var subvalue = comment(value, self.options) ||
    cdata(value) ||
    instruction(value) ||
    declaration(value) ||
    closing(value) ||
    opening(value);

  if (!subvalue) {
    return;
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true;
  }

  if (!self.inLink && EXPRESSION_HTML_LINK_OPEN.test(subvalue)) {
    self.inLink = true;
  } else if (self.inLink && EXPRESSION_HTML_LINK_CLOSE.test(subvalue)) {
    self.inLink = false;
  }

  return eat(subvalue)({
    type: 'html',
    value: subvalue
  });
}
