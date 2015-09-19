/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
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
 *     'contents': '# Hello'
 *   });
 *
 *   file.providedByUser = true;
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
    var fileSet = context.fileSet;
    var cli = fileSet.cli;
    var sourcePaths = fileSet.sourcePaths;
    var destinationPath;

    if (!context.output) {
        debug('Ignoring writing to file-system');

        done();

        return;
    }

    if (!file.namespace('mdast:cli').providedByUser) {
        debug('Ignoring programmatically added file');

        done();

        return;
    }

    destinationPath = file.filePath();

    if (!destinationPath) {
        debug('Ignoring file without output location');

        done();

        return;
    }

    /*
     * When watching, `sourcePath`s are watched.  Thus, we
     * check if we are planning on writing to a watched
     * file-path. In which case we exit.
     */

    if (cli.watch && (sourcePaths.indexOf(destinationPath) !== -1)) {
        debug('Caching document as `%s` is watched', destinationPath);

        cli.cache.add(file);

        done();
    } else {
        debug('Writing document to `%s`', destinationPath);

        file.stored = true;

        writeFile(destinationPath, file.toString(), done);
    }
}

/*
 * Expose.
 */

module.exports = fileSystem;
