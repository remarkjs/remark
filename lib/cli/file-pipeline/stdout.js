/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:file-pipeline:stdout
 * @fileoverview Write a file to stdout(4).
 */

'use strict';

/*
 * Dependencies.
 */

var debug = require('debug')('mdast:cli:file-pipeline:stdout');

/**
 * Write a virtual file to stdout(4).
 * Ignored when `output` is given, more than one file
 * was processed, or `stdout` is false.
 *
 * @example
 *   var cli = {'stdout': process.stdout.write};
 *   var fileSet = new FileSet(cli);
 *   var file = new File({
 *     'directory': '~',
 *     'filename': 'example',
 *     'extension': 'md',
 *     'contents': '# Hello'
 *   });
 *   fileSet.add(file);
 *
 *   stdout({
 *     'output': false,
 *     'file': file,
 *     'fileSet': fileSet
 *   });
 *
 * @param {Object} context
 */
function stdout(context) {
    var fileSet = context.fileSet;
    var file = context.file;

    if (
        fileSet.cli.out &&
        fileSet.length === 1 &&
        (!context.output || !file.filePath())
    ) {
        if (!file.namespace('mdast:cli').providedByUser) {
            debug('Ignoring programmatically added file');

            return;
        }

        debug('Writing document to standard out');

        fileSet.cli.stdout(context.file.toString());
    } else {
        debug('Ignoring writing to standard out');
    }
}

/*
 * Expose.
 */

module.exports = stdout;
