/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:file-set-pipeline:configure
 * @version 2.3.2
 * @fileoverview Configure a collection of files.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var Configuration = require('../configuration');

/**
 * Configure the CLI.
 *
 * @example
 *   configure({
 *     'detectRC': true,
 *     'settings': {'position': false},
 *   });
 *
 * @param {Object} context - Context object.
 */
function configure(context) {
    if (!context.configuration) {
        context.configuration = new Configuration({
            'detectRC': context.detectRC,
            'file': context.configPath,
            'settings': context.settings,
            'plugins': context.plugins,
            'output': context.output,
            'cwd': context.cwd
        });
    }
}

/*
 * Expose.
 */

module.exports = configure;
