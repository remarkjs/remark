/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:file-set-pipeline:transform
 * @version 2.3.2
 * @fileoverview Transform all files.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var FileSet = require('../file-set');

/**
 * Transform all files.
 *
 * @example
 *   var context = new CLI(['.', '-u toc']);
 *   transform(context, console.log);
 *
 * @param {Object} context - Context object.
 * @param {function(Error?)} done - Completion handler.
 */
function transform(context, done) {
    var fileSet = new FileSet(context);

    fileSet.done = done;

    context.files.forEach(fileSet.add, fileSet);

    context.fileSet = fileSet;
}

/*
 * Expose.
 */

module.exports = transform;
