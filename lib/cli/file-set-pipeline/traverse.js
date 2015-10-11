/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:file-set-pipeline:traverse
 * @version 2.1.0
 * @fileoverview Find files from the file-system.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var Traverser = require('../traverser');

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
function traverse(cli) {
    if (!cli.traverser) {
        cli.traverser = new Traverser({
            'extensions': cli.extensions,
            'ignorePath': cli.ignorePath,
            'detectIgnore': cli.detectIgnore,
            'cwd': cli.cwd
        });
    }
    cli.files = cli.traverser.traverse(cli.globs);
}

/*
 * Expose.
 */

module.exports = traverse;
