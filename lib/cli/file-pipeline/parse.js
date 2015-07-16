/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module mdast:cli:file-pipeline:parse
 * @fileoverview Parse a file into an AST.
 */

'use strict';

/*
 * Dependencies.
 */

var debug = require('debug')('mdast:cli:file-pipeline:parse');

/**
 * Fill a file with an ast.
 *
 * @example
 *   var file = new File({
 *     'contents': '# Hello'
 *   });
 *
 *   vat settings = {'position': false};
 *
 *   parse({'file': file, 'settings': settings});
 *
 *   file.ast.type; // 'root'
 *
 * @param {Object} context
 */
function parse(context) {
    var file = context.file;

    debug('Parsing document');

    file.ast = context.processor.parse(file, context.settings);

    debug('Parsed document');
}

/*
 * Expose.
 */

module.exports = parse;
