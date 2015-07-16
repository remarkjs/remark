/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module mdast:cli:file-set-pipeline:configure
 * @fileoverview Configure a collection of files.
 */

'use strict';

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
    var configuration = new Configuration({
        'detectRC': cli.detectRC,
        'file': cli.configPath,
        'settings': cli.settings,
        'plugins': cli.plugins,
        'cwd': cli.cwd
    });

    cli.configuration = configuration;
}

/*
 * Expose.
 */

module.exports = configure;
