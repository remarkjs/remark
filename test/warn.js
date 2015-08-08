'use strict';

/**
 * Transformer.
 */
function transformer(node, file) {
    file.warn('Warning');
}

/**
 * Attacher.
 */
function attacher() {
    return transformer;
}

/*
 * Expose.
 */

module.exports = attacher;
