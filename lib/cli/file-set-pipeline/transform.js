/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli:file-set-pipeline:transform
 * @fileoverview Transform all files.
 */

'use strict';

/*
 * Dependencies.
 */

var FileSet = require('../file-set');

/**
 * Transform all files.
 *
 * @example
 *   var cli = new CLI(['.', '-u toc']);
 *   transform(cli, console.log);
 *
 * @param {CLI} cli
 * @param {function(Error?)} done
 */
function transform(cli, done) {
    var fileSet = new FileSet(cli);

    fileSet.done = done;

    cli.files.forEach(fileSet.add, fileSet);

    cli.fileSet = fileSet;
}

/*
 * Expose.
 */

module.exports = transform;
