/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:file-set-pipeline:traverse
 * @version 2.3.2
 * @fileoverview Find files from the file-system.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var Ignore = require('../ignore');
var Finder = require('../finder');

/**
 * Find files from the file-system.
 *
 * @example
 *   traverse({
 *     'extensions': ['markdown']
 *   });
 *
 * @param {CLI} cli
 */
function traverse(cli, next) {
    /** Traverse. */
    function done() {
        cli.traverser.find(cli.globs, function (err, files) {
            cli.files = files || [];
            next(err);
        });
    }

    if (cli.traverser) {
        done();
    } else {
        new Ignore({
            'file': cli.ignorePath,
            'detectIgnore': cli.detectIgnore
        }).getPatterns(null, function (err, patterns) {
            cli.traverser = new Finder({
                'extensions': cli.extensions,
                'ignore': patterns || []
            });

            done();
        });
    }
}

/*
 * Expose.
 */

module.exports = traverse;
