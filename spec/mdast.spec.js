'use strict';

var mdast = require('..'),
    assert = require('assert'),
    fs = require('fs');

describe('mdast()', function () {
    it('should be of type `function`', function () {
        assert(typeof mdast === 'function');
    });
});

describe('msast.Parser()', function () {});

describe('msast.Lexer()', function () {});

describe('fixtures', function () {
    function validateInputs(children) {
        children.forEach(validateInput);
    }

    function validateInput(context) {
        var keys = Object.keys(context);

        if (!('type' in context)) {
            console.log('Context without type property:\n', context);
            throw new Error('Context without type property');
        }

        if ('children' in context) {
            assert(Array.isArray(context.children));
            validateInputs(context.children);
        }

        if ('value' in context) {
            assert(typeof context.value === 'string');
        }

        if (
            context.type === 'paragraph' ||
            context.type === 'blockquote' ||
            context.type === 'looseItem' ||
            context.type === 'listItem'
        ) {
            assert(keys.length === 2);
            assert('children' in context);

            return;
        }

        if (context.type === 'heading') {
            assert(keys.length === 3);
            assert(context.depth > 0);
            assert(context.depth <= 6);
            assert('children' in context);

            return;
        }

        if (context.type === 'code') {
            assert(keys.length === 2 || keys.length === 3);
            assert('value' in context);

            if ('lang' in context) {
                assert(context.lang === null || typeof context.lang === 'string')
            }

            return;
        }

        if (context.type === 'hr' || context.type === 'br') {
            assert(keys.length === 1);

            return;
        }

        if (context.type === 'list') {
            assert('children' in context);
            assert(typeof context.ordered === 'boolean');
            assert(keys.length === 3);

            return;
        }

        if (context.type === 'text') {
            assert(keys.length === 2);
            assert('value' in context);

            return;
        }

        if (
            context.type === 'strong' ||
            context.type === 'emphasis' ||
            context.type === 'delete'
        ) {
            assert(keys.length === 2);
            assert('children' in context);

            return;
        }

        if (context.type === 'link') {
            assert('children' in context);
            assert(
                context.title === null ||
                typeof context.title === 'string'
            );
            assert(typeof context.href === 'string');
            assert(keys.length === 4);

            return;
        }

        if (context.type === 'image') {
            assert(context.title === null || typeof context.alt === 'string');
            assert(typeof context.alt === 'string');
            assert(typeof context.href === 'string');
            assert(keys.length === 4);

            return;
        }

        if (context.type === 'table') {
            context.header.forEach(validateInputs);

            context.cells.forEach(function (row) {
                row.forEach(validateInputs);
            });

            assert(Array.isArray(context.align));

            context.align.forEach(function (align) {
                assert(
                    align === null ||
                    align === 'left' ||
                    align === 'right' ||
                    align === 'center'
                )
            });

            assert(keys.length === 4);

            return;
        }

        if (context.type === 'html') {
            assert(keys.length === 2);
            assert('value' in context);

            return;
        }

        throw new Error('Unknown token of type `' + type + '`');
    }

    fs.readdirSync(__dirname + '/input').filter(function (path) {
        return path.indexOf('.') !== 0;
    }).forEach(function (path) {
        var filename, input, output, json;

        filename = path.split('.');
        filename.pop();
        filename = filename.join('.');

        input = fs.readFileSync(__dirname + '/input/' + path, 'utf-8');
        output = fs.readFileSync(__dirname + '/output/' + filename + '.json', 'utf-8');
        input = mdast(input);
        validateInputs(input);

        it('should work on ' + filename, function () {
            output = JSON.parse(output);

            assert(JSON.stringify(input) === JSON.stringify(output));
        });
    })
    
});
