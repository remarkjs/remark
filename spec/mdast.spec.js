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
            throw new Error('Context without type property');
        }

        if ('children' in context) {
            assert(Array.isArray(context.children));
            validateInputs(context.children);
        }

        if (context.type === 'paragraph') {
            assert(keys.length === 2);
        }

        if (context.type === 'heading') {
            assert(keys.length === 3);
            assert(context.depth > 0);
            assert(context.depth <= 6);
        }

        if (context.type === 'code') {
            assert(keys.length === 2 || keys.length === 3);
            assert('value' in context);

            if ('lang' in context) {
                assert(context.lang === null || typeof context.lang === 'string')
            }
        }

        // if (context.type === 'paragraph') {
        //     assert(keys.length === 2);
        //     assert(Array.isArray(context.children));
        // }
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
