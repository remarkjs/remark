/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module mdast:cli:file-pipeline:file-system
 * @fileoverview Write a file to the file system.
 */

'use strict';

/*
 * Dependencies.
 */

var fs = require('fs');
var debug = require('debug')('mdast:cli:file-pipeline:file-system');

/*
 * Methods.
 */

var writeFile = fs.writeFile;

/**
 * Write a virtual file to the file-system.
 * Ignored when `output` is not given.
 *
 * @example
 *   var file = new File({
 *     'directory': '~',
 *     'filename': 'example',
 *     'extension': 'md',
 *     'contents': '# Hello',
 *     'providedByUser': true
 *   });
 *
 *   fileSystem({
 *     'output': true,
 *     'file': file
 *   });
 *
 * @param {Object} context
 * @param {function(Error?)} done
 */
function fileSystem(context, done) {
    var file = context.file;

    if (!context.output) {
        debug('Ignoring writing to file-system');

        done();

        return;
    }

    if (!file.providedByUser) {
        debug('Ignoring programmatically added file');

        done();

        return;
    }

    if (!file.filePath()) {
        debug('Ignoring file without output location');

        done();

        return;
    }

    debug('Writing document to `%s`', file.filePath());

    writeFile(file.filePath(), file.toString(), done);
}

/*
 * Expose.
 */

module.exports = fileSystem;
