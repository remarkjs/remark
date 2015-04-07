'use strict';

/**
 * Attacher.
 *
 * This simple plugin changes the extension of each given
 * file into `html` (you can change that by passing an
 * extension as an option).
 */
function attacher(mdast, options) {
    var extension = options && options.extension;

    if (!extension) {
        extension = 'html';
    }

    /**
     * Transformer.
     */
    function transformer(ast, file) {
        file.extension = extension;
    }

    return transformer;
}

/*
 * Expose.
 */

module.exports = attacher;
