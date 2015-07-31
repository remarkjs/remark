/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast
 * @fileoverview Markdown processor powered by plugins.
 */

'use strict';

/*
 * Dependencies.
 */

var unified = require('unified');
var Parser = require('./lib/parse.js');
var Compiler = require('./lib/stringify.js');

/*
 * Exports.
 */

module.exports = unified({
    'name': 'mdast',
    'type': 'ast',
    'Parser': Parser,
    'Compiler': Compiler
});
