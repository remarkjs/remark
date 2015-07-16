/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module file-pipeline/file-system
 * @fileoverview Write a file to the file system.
 */

'use strict';

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');
var debug = require('debug')('mdast:file-pipeline:file-system');

/*
 * Methods.
 */

var writeFile = fs.writeFile;
var stat = fs.statSync;
var basename = path.basename;
var extname = path.extname;
var dirname = path.dirname;
var resolve = path.resolve;

/*
 * Constants.
 */

var SEPERATOR = path.sep;

/**
 * Write a virtual file to the file-system.
 * Ignored when `output` is not given.
 *
 * @example
 *   var cli = {'output': true};
 *   var fileSet = new FileSet(cli);
 *   var file = new File({
 *     'directory': '~',
 *     'filename': 'example',
 *     'extension': 'md',
 *     'contents': '# Hello'
 *   });
 *   fileSet.add(file);
 *
 *   fileSystem({
 *     'file': file,
 *     'fileSet': fileSet
 *   });
 *
 * @param {Object} context
 * @param {function(Error?)} done
 */
function fileSystem(context, done) {
    var fileSet = context.fileSet;
    var file = context.file;
    var cli = fileSet.cli;
    var outpath = cli.output;
    var multi = fileSet.length > 1;
    var currentPath;
    var isDir;
    var extension;

    if (!outpath) {
        debug('Ignoring writing to file-system');

        done();

        return;
    }

    debug('Writing to file-system');

    currentPath = file.filePath();

    if (outpath !== true) {
        try {
            isDir = stat(resolve(outpath)).isDirectory();
        } catch (err) {
            if (
                err.code !== 'ENOENT' ||
                outpath.charAt(outpath.length - 1) === SEPERATOR
            ) {
                err.message = 'Cannot read output directory. Error:\n' +
                    err.message;

                throw err;
            }

            /*
             * This throws, or the parent exists, which
             * is a directory, but we should keep the
             * filename and extension of the given
             * file.
             */

            stat(resolve(dirname(outpath))).isDirectory();
            isDir = false;
        }

        if (!isDir && multi) {
            throw new Error(
                'Cannot write multiple files to single output: ' + outpath
            );
        }

        extension = extname(outpath);

        file.move({
            'extension': isDir ? '' : extension ? extension.slice(1) : '',
            'filename': isDir ? '' : basename(outpath, extension),
            'directory': isDir ? outpath : dirname(outpath)
        });

        debug('Copying document from %s to %s', currentPath, file.filePath());
    }

    debug('Writing document to `%s`', file.filePath());

    writeFile(file.filePath(), file.toString(), done);
}

/*
 * Expose.
 */

module.exports = fileSystem;
