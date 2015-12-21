'use strict';

/* eslint-env node */

/**
 * Transformer.
 *
 * @param {Node} node - Syntax-tree.
 * @param {VFile} file - Virtual file.
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
