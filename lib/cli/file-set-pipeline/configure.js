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
 * @param {CLI} cli
 */
function configure(cli) {
    if (!cli.configuration) {
        cli.configuration = new Configuration({
            'detectRC': cli.detectRC,
            'file': cli.configPath,
            'settings': cli.settings,
            'plugins': cli.plugins,
            'output': cli.output,
            'cwd': cli.cwd
        });
    }
}

/*
 * Expose.
 */

module.exports = configure;
