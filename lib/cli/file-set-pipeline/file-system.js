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
 * @param {Object} context - Context object.
 * @param {function(Error?)} done - Callback invoked when
 *   done.
 */
function traverse(context, done) {
    /** Traverse. */
    function next() {
        context.traverser.find(context.globs, function (err, files) {
            context.files = files || [];
            done(err);
        });
    }

    if (context.traverser) {
        next();
    } else {
        new Ignore({
            'file': context.ignorePath,
            'detectIgnore': context.detectIgnore
        }).getPatterns(null, function (err, patterns) {
            context.traverser = new Finder({
                'extensions': context.extensions,
                'ignore': patterns || []
            });

            next();
        });
    }
}

/*
 * Expose.
 */

module.exports = traverse;
