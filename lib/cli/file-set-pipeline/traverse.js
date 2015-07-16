/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module file-set-pipeline/traverse
 * @fileoverview Find files from the file-system.
 */

'use strict';

/*
 * Dependencies.
 */

var Traverser = require('../traverse');

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
    var traverser = new Traverser({
        'extensions': cli.extensions,
        'ignorePath': cli.ignorePath,
        'detectIgnore': cli.detectIgnore,
        'cwd': cli.cwd
    });

    cli.files = traverser.traverse(cli.globs);
}

/*
 * Expose.
 */

module.exports = traverse;
