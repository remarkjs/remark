/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:log
 * @fileoverview Log a file context on successful completion.
 */

'use strict';

/*
 * Dependencies.
 */

var debug = require('debug')('mdast:cli:file-pipeline:log');
var chalk = require('chalk');
var format = require('../formatter');

/**
 * Log messages on a file.
 *
 * @example
 *   var fileSet = new FileSet(cli);
 *   var file = new File({
 *     'directory': '~',
 *     'filename': 'example',
 *     'extension': 'md'
 *   });
 *
 *   log({
 *     'file': file,
 *     'fileSet': fileSet
 *   });
 *
 * @param {Object} context
 */
function log(context) {
    var file = context.file;
    var cli = context.fileSet.cli;
    var fn = cli.log.bind(cli);
    var space = file.namespace('mdast:cli');
    var fromPath;
    var result;
    var filePath;

    if (!file.filename) {
        file.filename = '<stdin>';
        file.extension = '';
    }

    fromPath = space.originalPath || file.filePath();

    if (!space.providedByUser) {
        debug('Ignoring programmatically added file');

        return;
    }

    /*
     * Remove non-fatal messages in silent mode.
     */

    if (cli.silent) {
        file.messages = file.messages.filter(function (message) {
            return message.fatal === true;
        });
    }

    filePath = file.filePath();
    result = format([file]);

    result = result.split('\n').slice(2).join('\n');

    if (result) {
        fn = cli.stderr.bind(cli);
        fn('');
    }

    /*
     * Ensure we exit with `1` if a `fatal` error.
     * exists in `file`.
     */
    if (!context.output) {
        fn(
            chalk.underline(filePath) + ': ' + chalk.yellow('done') + '.'
        );
    } else {
        fn(
            chalk.underline(fromPath) +
            (filePath !== fromPath ? ' > ' + chalk.green(filePath) : '') +
            ': ' + chalk.green('written') + '.'
        );
    }

    if (result) {
        fn(result);
    }
}

/*
 * Expose.
 */

module.exports = log;
