/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:cli:file-set-pipeline:stdin
 * @version 3.1.0
 * @fileoverview Read from stdin.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var debug = require('debug')('remark:cli:file-set-pipeline:stdin');
var fs = require('fs');
var toVFile = require('to-vfile');
var concat = require('concat-stream');

/*
 * Constants.
 */

var isTTY = process.stdin.isTTY;
var isFIFO = fs.statSync('.').isFIFO();

var definitelyTTY = isTTY === true || isFIFO === true;
var expextPipeIn = !isTTY;

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

        if (definitelyTTY && expextPipeIn) {
            err = new Error('remark does not accept both files and stdin');
        } else if (context.filePath) {
            err = new Error(
                'remark does not accept `--file-path` for real files.\n' +
                'Did you mean to pass stdin?'
            );
        }

        done(err);

        return;
    }

    if (definitelyTTY && !expextPipeIn) {
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
