/**
 * @author Titus Wormer
 * @copyright 2015-2016 Titus Wormer
 * @license MIT
 * @module remark:cli:file-pipeline:parse
 * @version 4.2.2
 * @fileoverview Parse a file into an AST.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var debug = require('debug')('remark:cli:file-pipeline:parse');

/**
 * Fill a file with an ast.
 *
 * @example
 *   var file = new File({
 *     'contents': '# Hello'
 *   });
 *
 *   var settings = {'position': false};
 *
 *   parse({'file': file, 'settings': settings});
 *
 *   file.namespace('mdast').tree.type; // 'root'
 *
 * @param {Object} context - Context object.
 */
function parse(context) {
    var file = context.file;

    if (file.hasFailed()) {
        return;
    }

    if (context.fileSet.cli.treeIn) {
        debug('Not parsing already parsed document');

        try {
            file.namespace('mdast').tree = JSON.parse(file.toString());
        } catch (err) {
            file.fail(err);
        }

        file.contents = '';

        return;
    }

    debug('Parsing document');

    context.processor.parse(file, context.settings);

    debug('Parsed document');
}

/*
 * Expose.
 */

module.exports = parse;
