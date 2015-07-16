/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module file-pipeline/stringify
 * @fileoverview Compile an AST into a file.
 */

'use strict';

/*
 * Dependencies.
 */

var debug = require('debug')('mdast:file-pipeline:stringify');

/**
 * Stringify an AST.
 *
 * @example
 *   var fileSet = new FileSet(cli);
 *   var file = new File({
 *     'contents': '# Hello'
 *   });
 *   fileSet.add(file);
 *
 *   var context = {'processor': mdast(), 'file': file, 'fileSet': fileSet};
 *
 *   parse(context);
 *   stringify(context);
 *
 * @param {Object} context
 */
function stringify(context) {
    var cli = context.fileSet.cli;
    var file = context.file;
    var value;

    debug('Compiling document');

    if (cli.ast) {
        file.move({
            'extension': 'json'
        });

        value = JSON.stringify(file.ast, null, 2);
    } else {
        value = context.processor.stringify(file.ast, file, context.settings);
    }

    file.contents = value;

    debug('Compiled document to %s', file.extension || 'markdown');
}

/*
 * Expose.
 */

module.exports = stringify;
