'use strict';

var mdast, assert, fixtures, validateToken, validateTokens;

mdast = require('..');
assert = require('assert');
fixtures = require('./fixtures.js');

describe('mdast()', function () {
    it('should be of type `function`', function () {
        assert(typeof mdast === 'function');
    });
});

describe('msast.Parser()', function () {});

describe('msast.Lexer()', function () {});

validateTokens = function (children) {
    children.forEach(validateToken);
};

validateToken = function (context) {
    var keys = Object.keys(context),
        type = context.type,
        key;

    assert('type' in context);

    if ('children' in context) {
        assert(Array.isArray(context.children));
        validateTokens(context.children);
    }

    if ('value' in context) {
        assert(typeof context.value === 'string');
    }

    if (type === 'root') {
        assert('children' in context);

        if (context.footnotes) {
            for (key in context.footnotes) {
                validateTokens(context.footnotes[key]);
            }
        }

        return;
    }

    if (
        type === 'paragraph' ||
        type === 'blockquote' ||
        type === 'listItem'
    ) {
        assert(keys.length === 2);
        assert('children' in context);

        return;
    }

    if (type === 'footnote') {
        assert(keys.length === 2);
        assert('id' in context);

        return;
    }

    if (type === 'heading') {
        assert(keys.length === 3);
        assert(context.depth > 0);
        assert(context.depth <= 6);
        assert('children' in context);

        return;
    }

    if (type === 'code') {
        assert(keys.length === 2 || keys.length === 3);
        assert('value' in context);

        if ('lang' in context) {
            assert(
                context.lang === null ||
                typeof context.lang === 'string'
            );
        }

        return;
    }

    if (type === 'horizontalRule' || type === 'break') {
        assert(keys.length === 1);

        return;
    }

    if (type === 'list') {
        assert('children' in context);
        assert(typeof context.ordered === 'boolean');
        assert(keys.length === 3);

        return;
    }

    if (type === 'text') {
        assert(keys.length === 2);
        assert('value' in context);

        return;
    }

    if (
        type === 'strong' ||
        type === 'emphasis' ||
        type === 'delete'
    ) {
        assert(keys.length === 2);
        assert('children' in context);

        return;
    }

    if (type === 'link') {
        assert('children' in context);
        assert(
            context.title === null ||
            typeof context.title === 'string'
        );
        assert(typeof context.href === 'string');
        assert(keys.length === 4);

        return;
    }

    if (type === 'image') {
        assert(
            context.title === null ||
            typeof context.title === 'string'
        );
        assert(
            context.alt === null ||
            typeof context.alt === 'string'
        );
        assert(typeof context.src === 'string');
        assert(keys.length === 4);

        return;
    }

    if (type === 'table') {
        context.header.forEach(validateTokens);

        context.rows.forEach(function (row) {
            row.forEach(validateTokens);
        });

        assert(Array.isArray(context.align));

        context.align.forEach(function (align) {
            assert(
                align === null ||
                align === 'left' ||
                align === 'right' ||
                align === 'center'
            );
        });

        assert(keys.length === 4);

        return;
    }

    /* This is the last possible type. If more types are added, they
     * should be added before this block, or the type:html tests should
     * be wrapped in an if statement. */
    assert(type === 'html');
    assert(keys.length === 2);
    assert('value' in context);
};

describe('fixtures', function () {
    fixtures.forEach(function (fixture) {
        it('should work on ' + fixture.name, function () {
            var root = mdast(fixture.input, fixture.options),
                baseline = fixture.output;

            validateToken(root);
            baseline = JSON.parse(baseline);

            try {
                assert(JSON.stringify(root) === JSON.stringify(baseline));
            } catch (error) {
                /* istanbul ignore next: Shouldn't reach, helps debugging. */
                console.log(
                    JSON.stringify(root, null, 2),
                    JSON.stringify(baseline, null, 2)
                );

                /* istanbul ignore next: Shouldn't reach, helps debugging. */
                throw error;
            }
        });
    });
});
