/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli
 * @fileoverview CLI Engine.
 */

'use strict';

/*
 * Dependencies.
 */

var chalk = require('chalk');
var CLI = require('./cli');
var fileSetPipeline = require('./file-set-pipeline');

/**
 * CLI engine. This is used by `bin/mdast`.
 *
 * @example
 *   engine('--use toc . --output --quiet', console.log);
 *
 * @param {Array.<*>|Object} argv - CLI arguments.
 * @param {function(Error?, boolean)} done - Callback
 *   invoked when done.
 */
function engine(argv, done) {
    var cli = new CLI(argv);
    var enabled = chalk.enabled;

    chalk.enabled = cli.color;

    fileSetPipeline.run(cli, function (err) {
        /*
         * Check if any file has failed.
         */

        var hasFailed = (cli.files || []).some(function (file) {
            return (file.messages || []).some(function (message) {
                return message.fatal === true ||
                    (message.fatal === false && cli.frail);
            });
        });

        chalk.enabled = enabled;

        done(err, !hasFailed);
    });
}

/*
 * Expose.
 */

module.exports = engine;
