'use strict';

var mdast = require('..'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path');

describe('mdast()', function () {
    it('should be of type `function`', function () {
        assert(typeof mdast === 'function');
    });
});

describe('msast.Parser()', function () {});

describe('msast.Lexer()', function () {});

describe('fixtures', function () {
    var validateInput, validateInputs, optionsMap;

    validateInputs = function (children) {
        children.forEach(validateInput);
    };

    validateInput = function (context) {
        var keys = Object.keys(context),
            type = context.type;

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
            type === 'paragraph' ||
            type === 'blockquote' ||
            type === 'looseItem' ||
            type === 'listItem'
        ) {
            assert(keys.length === 2);
            assert('children' in context);

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

        if (type === 'hr' || type === 'br') {
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
            assert(context.title === null || typeof context.alt === 'string');
            assert(typeof context.alt === 'string');
            assert(typeof context.href === 'string');
            assert(keys.length === 4);

            return;
        }

        if (type === 'table') {
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
                );
            });

            assert(keys.length === 4);

            return;
        }

        if (type === 'html') {
            assert(keys.length === 2);
            assert('value' in context);

            return;
        }

        throw new Error('Unknown token of type `' + type + '`');
    };

    optionsMap = {
        'gfm' : ['gfm', true],
        'nogfm' : ['gfm', false],
        'tables' : ['tables', true],
        'notables' : ['tables', false],
        'breaks' : ['breaks', true],
        'nobreaks' : ['breaks', false],
        'pedantic' : ['pedantic', true],
        'nopedantic' : ['pedantic', false],
        'smartlists' : ['smartlists', true],
        'nosmartlists' : ['smartlists', false]
    };

    fs.readdirSync(path.join(__dirname, 'input')).filter(function (filepath) {
        return filepath.indexOf('.') !== 0;
    }).forEach(function (filepath) {
        var options, filename, input, output, flag, index;

        filename = filepath.split('.');
        filename.pop();


        if (filename.length > 1) {
            index = 0;
            options = {};

            while (filename[++index]) {
                flag = optionsMap[filename[index]];
                options[flag[0]] = flag[1];
            }

            console.log(options);
        }

        filename = filename.join('.');

        input = fs.readFileSync(
            path.join(__dirname, 'input', filepath),
            'utf-8'
        );

        output = fs.readFileSync(
            path.join(__dirname, 'output', filename + '.json'),
            'utf-8'
        );

        input = mdast(input, options);
        validateInputs(input);

        it('should work on ' + filename, function () {
            output = JSON.parse(output);

            assert(JSON.stringify(input) === JSON.stringify(output));
        });
    });
});
