/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse
 * @fileoverview Markdown parser.
 */

'use strict';

var unherit = require('unherit');
var Parser = require('./lib/parser.js');

module.exports = exports = parse;
exports.Parser = Parser;

function parse(processor) {
  processor.Parser = unherit(Parser);
}
