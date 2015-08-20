/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:file-set-pipeline:stdin
 * @fileoverview Read from stdin.
 */

'use strict';

/*
 * Dependencies.
 */

var debug = require('debug')('mdast:cli:file-set-pipeline:stdin');
var toVFile = require('to-vfile');
var concat = require('concat-stream');

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
        var file = toVFile(program.filePath || '');
        var space = file.namespace('mdast:cli');

        debug('Read from stdin');

        file.contents = value;
        file.quiet = true;
        space.exists = true;
        space.isFile = true;
        space.providedByUser = true;

        program.files = [file];

        callback();
    }));
}

module.exports = stdin;
