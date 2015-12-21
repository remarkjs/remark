/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:log
 * @version 2.3.2
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
function given(file) {
    return file.namespace('mdast:cli').given;
}

/**
 * Output diagnostics to stdout(4) or stderr(4).
 *
 * @param {CLI} context - CLI engine.
 */
function log(context) {
    var diagnostics = report(context.files.filter(given), {
        'quiet': context.quiet,
        'silent': context.silent
    });

    if (!context.color) {
        diagnostics = chalk.stripColor(diagnostics);
    }

    if (diagnostics) {
        context.stderr.write(diagnostics + '\n');
    }
}

/*
 * Expose.
 */

module.exports = log;
