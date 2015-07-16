/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module mdast:cli:file-pipeline:stdout
 * @fileoverview Write a file to stdout.
 */

'use strict';

/*
 * Dependencies.
 */

var debug = require('debug')('mdast:cli:file-pipeline:stdout');

/**
 * Write a virtual file to stdout.
 * Ignored when `output` is given or more than one file
 * was processed.
 *
 * @example
 *   var cli = {'output': false, 'stdout': process.stdout.write};
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
 *     'file': file,
 *     'fileSet': fileSet
 *   });
 *
 * @param {Object} context
 */
function stdout(context) {
    var fileSet = context.fileSet;
    var cli = fileSet.cli;

    /*
     * `stdout`.
     */

    if (fileSet.length === 1 && !cli.output) {
        debug('Writing document to standard out');

        cli.stdout(context.file.toString());
    } else {
        debug('Ignoring writing to standard out');
    }
}

/*
 * Expose.
 */

module.exports = stdout;
