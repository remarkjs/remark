'use strict';

/* eslint-env node */

/**
 * Check if `node` is the main heading.
 *
 * @param {Node} node - Node to check.
 * @return {boolean} - Whether `node` is the main heading.
 */
function isHeading(node) {
    return node && node.type === 'heading' && node.depth === 1;
}

/**
 * Get the value of `node`.
 *
 * @param {Node} node - Node whose value to access.
 * @return {string} - Textual representation of `node`.
 */
function getValue(node) {
    return node &&
        ('value' in node ? node.value :
        ('alt' in node ? node.alt :
        ('title' in node ? node.title : '')));
}

/**
 * Check if `node` has children.
 *
 * @param {Node} node - Node to check.
 * @return {boolean} - Whether `node` has children.
 */
function hasChildren(node) {
    return node && 'children' in node;
}

/**
 * Search a node for a main heading.
 *
 * @param {Node} node - Node to search.
 * @return {Node?} - Heading node.
 */
function search(node) {
    var index;
    var length;
    var result;

    if (isHeading(node)) {
        return node;
    }

    if (hasChildren(node)) {
        index = -1;
        length = node.children.length;

        while (++index < length) {
            result = search(node.children[index]);

            if (result) {
                return result;
            }
        }
    }

    return null;
}

/**
 * Returns the text content of a node.
 * Checks `alt` or `title` when no value or children
 * exist.
 *
 * @param {Node} node - Node to stringify.
 * @return {string} - Textual representation of `node`.
 */
function toString(node) {
    return getValue(node) || node.children.map(toString).join('') || '';
}

/**
 * Create an npm badge, with a space before it.
 * Creates a flat badge when `options.flat: true`.
 *
 * @param {string} name - Project name.
 * @param {Object?} [options] - Configuration.
 * @param {boolean?} [options.flat] - Whether to render a
 *   flat badge.
 * @return {Array.<Node>} - Nodes.
 */
function createBadge(name, options) {
    var href = 'https://www.npmjs.com/package/' + name;
    var src = 'http://img.shields.io/npm/v/' + name + '.svg';

    if (options && options.flat) {
        src += '?style=flat';
    }

    return [
        {
            'type': 'text',
            'value': ' '
        },
        {
            'type': 'link',
            'title': null,
            'url': href,
            'children': [
                {
                    'type': 'image',
                    'title': null,
                    'url': src,
                    'alt': 'Version'
                }
            ]
        }
    ];
}

/**
 * Attach.
 *
 * @param {Remark} remark - Processor.
 * @param {Object} options - Configuration.
 * @return {Function} - Transformer.
 */
function attach(remark, options) {
    /**
     * Adds an npm version badge to the main heading,
     * when available.
     *
     * @param {Node} node - AST.
     */
    return function (node) {
        var head = search(node);

        if (head) {
            head.children = head.children.concat(
                createBadge(toString(head), options)
            );
        }
    };
}

/*
 * Expose `attach`.
 */

module.exports = attach;
