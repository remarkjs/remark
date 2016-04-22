/**
 * @author Titus Wormer
 * @copyright 2015-2016 Titus Wormer
 * @license MIT
 * @module remark:cli:file-set-pipeline:stdin
 * @version 4.2.2
 * @fileoverview Read from stdin.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var debug = require('debug')('remark:cli:file-set-pipeline:stdin');
var toVFile = require('to-vfile');
var concat = require('concat-stream');

/*
 * Constants.
 */

var isTTY = process.stdin.isTTY;

/**
 * Read from standard in.
 *
 * @param {Object} context - Context object.
 * @param {function(Error?)} done - Completion handler.
 */
function stdin(context, done) {
    var err;

    debug('Checking stdin');

    if (context.files.length) {
        debug('Ignoring stdin');

        if (context.filePath) {
            err = new Error(
                'remark does not accept `--file-path` for real files.\n' +
                'Did you mean to pass stdin?'
            );
        }

        done(err);

        return;
    }

    if (isTTY) {
        done(new Error('No input'));

        return;
    }

    debug('Reading from stdin');

    process.stdin.pipe(concat({
        'encoding': 'string'
    }, function (value) {
        var file = toVFile(context.filePath || '');
        var space = file.namespace('remark:cli');

        debug('Read from stdin');

        file.contents = value;
        file.quiet = true;
        space.isFile = true;
        space.given = true;

        context.files = [file];

        done();
    }));
}

module.exports = stdin;
