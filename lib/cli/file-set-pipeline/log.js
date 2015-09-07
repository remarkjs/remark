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

var chalk = require('chalk');
var report = require('vfile-reporter');

/**
 * Output diagnostics to stdout(4) or stderr(4).
 *
 * @param {CLI} context - CLI engine.
 */
function log(context) {
    var files = context.files;
    var applicables = files.filter(function (file) {
        return file.namespace('mdast:cli').providedByUser;
    });
    var diagnostics = report(applicables, {
        'quiet': context.quiet,
        'silent': context.silent
    });

    if (!context.color) {
        diagnostics = chalk.stripColor(diagnostics);
    }

    if (diagnostics) {
        context.stderr(diagnostics);
    }
}

/*
 * Expose.
 */

module.exports = log;
