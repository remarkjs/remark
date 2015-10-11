/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:log
 * @version 2.1.0
 * @fileoverview Log a file context on successful completion.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var chalk = require('chalk');
var report = require('vfile-reporter');

/**
 * Whether a file is given by the user on mdast(1).
 *
 * @param {VFile} file - Virtual file.
 * @return {boolean} - Whether given by user.
 */
function providedByUser(file) {
    return file.namespace('mdast:cli').providedByUser;
}

/**
 * Output diagnostics to stdout(4) or stderr(4).
 *
 * @param {CLI} context - CLI engine.
 */
function log(context) {
    var files = context.files;
    var applicables = files.filter(providedByUser);
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
