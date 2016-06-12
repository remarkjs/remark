/**
 * @author Titus Wormer
 * @copyright 2015-2016 Titus Wormer
 * @license MIT
 * @fileoverview Assert `mdast` nodes.
 */

'use strict';

/* eslint-env node */
/* jscs:disable jsDoc */
/* jscs:disable maximumLineLength */

/* Dependencies. */
var assert = require('assert');

/* Validate `node`. */
function mdast(node) {
    var keys = Object.keys(node).length;
    var type = node.type;

    assert.ok('type' in node);

    if ('children' in node) {
        assert.ok(Array.isArray(node.children));
        children(node.children);
    }

    /*
     * Validate position.
     */

    if (node.position) {
        assert.ok('start' in node.position);
        assert.ok('end' in node.position);

        assert.ok('line' in node.position.start);
        assert.ok('column' in node.position.start);

        assert.ok('line' in node.position.end);
        assert.ok('column' in node.position.end);
    }

    if ('position' in node) {
        keys--;
    }

    if ('value' in node) {
        assert.equal(typeof node.value, 'string');
    }

    if (type === 'root') {
        assert.ok('children' in node);

        if (node.footnotes) {
            Object.keys(node.footnotes).forEach(function (id) {
                mdast(node.footnotes[id]);
            });
        }

        return;
    }

    if (
        type === 'paragraph' ||
        type === 'blockquote' ||
        type === 'tableRow' ||
        type === 'tableCell' ||
        type === 'strong' ||
        type === 'emphasis' ||
        type === 'delete'
    ) {
        assert.equal(keys, 2);
        assert.ok('children' in node);

        return;
    }

    if (type === 'listItem') {
        assert.ok(keys === 3 || keys === 4);
        assert.ok('children' in node);
        assert.equal(typeof node.loose, 'boolean');

        if (keys === 4) {
            assert.ok(
                node.checked === true ||
                node.checked === false ||
                node.checked === null
            );
        }

        return;
    }

    if (type === 'footnote') {
        assert.equal(keys, 2);
        assert.ok('children' in node);

        return;
    }

    if (type === 'heading') {
        assert.equal(keys, 3);
        assert.ok(node.depth > 0);
        assert.ok(node.depth <= 6);
        assert.ok('children' in node);

        return;
    }

    if (
        type === 'text' ||
        type === 'inlineCode' ||
        type === 'yaml'
    ) {
        assert.equal(keys, 2);
        assert.ok('value' in node);

        return;
    }

    if (type === 'code') {
        assert.equal(keys, 3);
        assert.ok('value' in node);

        assert.ok(
            node.lang === null ||
            typeof node.lang === 'string'
        );

        return;
    }

    if (type === 'thematicBreak' || type === 'break') {
        assert.equal(keys, 1);

        return;
    }

    if (type === 'list') {
        assert.ok('children' in node);
        assert.equal(typeof node.ordered, 'boolean');
        assert.equal(typeof node.loose, 'boolean');
        assert.equal(keys, 5);

        if (node.ordered) {
            assert.equal(typeof node.start, 'number');
            assert.equal(node.start, node.start); // NaN
        } else {
            assert.equal(node.start, null);
        }

        return;
    }

    if (type === 'footnoteDefinition') {
        assert.equal(keys, 3);
        assert.ok('children' in node);
        assert.equal(typeof node.identifier, 'string');

        return;
    }

    if (type === 'definition') {
        assert.equal(typeof node.identifier, 'string');

        assert.ok(
            node.title === null ||
            typeof node.title === 'string'
        );

        assert.equal(typeof node.url, 'string');
        assert.equal(node.link, undefined);

        assert.equal(keys, 4);

        return;
    }

    if (type === 'link') {
        assert.ok('children' in node);

        assert.ok(
            node.title === null ||
            typeof node.title === 'string'
        );

        assert.equal(typeof node.url, 'string');
        assert.equal(node.href, undefined);
        assert.equal(keys, 4);

        return;
    }

    if (type === 'image') {
        assert.ok(
            node.title === null ||
            typeof node.title === 'string'
        );

        assert.ok(
            node.alt === null ||
            typeof node.alt === 'string'
        );

        assert.equal(typeof node.url, 'string');
        assert.equal(node.src, undefined);
        assert.equal(keys, 4);

        return;
    }

    if (type === 'linkReference') {
        assert.ok('children' in node);
        assert.equal(typeof node.identifier, 'string');

        assert.ok(
            node.referenceType === 'shortcut' ||
            node.referenceType === 'collapsed' ||
            node.referenceType === 'full'
        );

        assert.equal(keys, 4);

        return;
    }

    if (type === 'imageReference') {
        assert.equal(typeof node.identifier, 'string');

        assert.ok(
            node.alt === null ||
            typeof node.alt === 'string'
        );

        assert.ok(
            node.referenceType === 'shortcut' ||
            node.referenceType === 'collapsed' ||
            node.referenceType === 'full'
        );

        assert.equal(keys, 4);

        return;
    }

    if (type === 'footnoteReference') {
        assert.equal(typeof node.identifier, 'string');
        assert.equal(keys, 2);

        return;
    }

    if (type === 'table') {
        assert.equal(keys, 3);
        assert.ok('children' in node);

        assert.ok(Array.isArray(node.align));

        node.align.forEach(function (align) {
            assert.ok(
                align === null ||
                align === 'left' ||
                align === 'right' ||
                align === 'center'
            );
        });

        return;
    }

    /* This is the last possible type. If more types are added, they
     * should be added before this block, or the type:html tests should
     * be wrapped in an if statement. */
    assert.equal(type, 'html');
    assert.equal(keys, 2);
    assert.ok('value' in node);
}

/* Validate `nodes`. */
function children(nodes) {
    nodes.forEach(mdast);
}

/* Expose. */
module.exports = mdast;
