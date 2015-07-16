/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module mdast:cli:file-set-pipeline:transform
 * @fileoverview Transform all files.
 */

'use strict';

/*
 * Dependencies.
 */

var chalk = require('chalk');
var format = require('../formatter');

/**
 * Log messages on all files.
 *
 * @example
 *   var cli = new CLI(['DOES_NOT_EXIST.md']);
 *   log(cli);
 *
 * @param {CLI} cli
 */
function log(cli) {
    cli.files.forEach(function (file) {
        var fromPath = file.originalPath || file.filePath();
        var result;
        var filePath;

        /*
         * Remove non-fatal messages in silent mode.
         */

        if (cli.silent) {
            file.messages = file.messages.filter(function (message) {
                return message.fatal === true;
            });
        }

        if (!file.filename) {
            file.filename = '<stdin>';
            file.extension = '';
        }

        filePath = file.filePath();
        result = format([file]);

        /*
         * Ensure we exit with `1` if a `fatal` error.
         * exists in `file`.
         */

        if (result) {
            cli.stderr(result);
        } else {
            if (!cli.output) {
                cli.log(
                    chalk.underline(filePath) + ': ' +
                    chalk.yellow('done') + '.'
                );
            } else {
                cli.log(
                    chalk.underline(fromPath) +
                    (filePath !== fromPath ? ' > ' +
                    chalk.green(filePath) : '') +
                    ': ' + chalk.green('written') + '.'
                );
            }
        }
    });
}

/*
 * Expose.
 */

module.exports = log;
