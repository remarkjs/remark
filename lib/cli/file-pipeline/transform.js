/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module file-pipeline/transform
 * @fileoverview Transform an AST associated with a file.
 */

'use strict';

/*
 * Dependencies.
 */

var debug = require('debug')('mdast:file-pipeline:parse');

/**
 * Transform the `ast` associated with a file with
 * configured plug-ins.
 *
 * @example
 *   var file = new File();
 *
 *   file.ast = {
 *     'type': 'paragraph',
 *     'children': [{
 *       'type': 'text',
 *       'value': 'Foo.'
 *     }]
 *   };
 *
 *   transform({'file': file}, console.log);
 *
 * @param {Object} context
 * @param {function(Error?)} done
 */
function transform(context, done) {
    var file = context.file;

    debug('Transforming document');

    context.processor.run(file.ast, file, function (err) {
        debug('Transformed document (err: %s)', err);

        done(err);
    });
}

/*
 * Expose.
 */

module.exports = transform;
