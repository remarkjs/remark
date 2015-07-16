/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module file-set-pipeline/stdin
 * @fileoverview Read from stdin.
 */

'use strict';

/*
 * Dependencies.
 */

var path = require('path');
var debug = require('debug')('mdast:file-set-pipeline:stdin');
var concat = require('concat-stream');
var File = require('../../file');

/*
 * Methods.
 */

var basename = path.basename;
var extname = path.extname;
var dirname = path.dirname;

/*
 * Constants.
 */

var expextPipeIn = !process.stdin.isTTY;

/**
 * Read from standard in.
 *
 * @param {CLI|Object} program - Options.
 * @param {function(Error?)} callback
 */
function stdin(program, callback) {
    var err;

    debug('Checking stdin');

    if (program.files.length) {
        debug('Ignoring stdin');

        if (expextPipeIn) {
            err = new Error('mdast does not accept both files and stdin');
        } else if (program.filePath) {
            err = new Error(
                'mdast does not accept `--file-path` for real files.\n' +
                'Did you mean to pass stdin?'
            );
        }

        callback(err);

        return;
    }

    if (!expextPipeIn) {
        callback(new Error('No input'));

        return;
    }

    debug('Reading from stdin');

    process.stdin.pipe(concat({
        'encoding': 'string'
    }, function (value) {
        var filePath = program.filePath;
        var extension = filePath && extname(filePath);
        var file = new File(filePath ? {
            'directory': dirname(filePath),
            'filename': basename(filePath, extension),
            'extension': extension.slice(1)
        } : {});

        debug('Read from stdin');

        file.contents = value;

        file.quiet = true;
        file.exists = true;
        file.isFile = true;

        program.files = [file];

        callback();
    }));
}

module.exports = stdin;
