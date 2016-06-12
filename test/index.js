/**
 * @author Titus Wormer
 * @copyright 2015-2016 Titus Wormer
 * @license MIT
 * @module remark
 * @fileoverview Test suite for remark, remark-parse,
 *   and remark-stringify.
 */

'use strict';

/* eslint-env node */
/* jscs:disable jsDoc */
/* jscs:disable maximumLineLength */

var path = require('path');
var fs = require('fs');
var test = require('tape');
var VFile = require('vfile');
var extend = require('extend');
var remark = require('../packages/remark');
var fixtures = require('./fixtures');
var mdast = require('./mdast.js');

/* Construct an empty node. */
function empty() {
    return {
        'type': 'root',
        'children': []
    };
}

/* Test `remark-parse`. */
test('remark().parse(file, options?)', function (t) {
    t.equal(
        remark().parse('Alfred').children.length,
        1,
        'should accept a `string`'
    );

    t.throws(
        function () {
            remark().parse('', true);
        },
        /options/,
        'should throw when `options` is not an object'
    );

    t.throws(
        function () {
            remark().parse('', {
                'position': 0
            });
        },
        /options.position/,
        'should throw when `options.position` is not a boolean'
    );

    t.throws(
        function () {
            remark().parse('', {
                'gfm': Infinity
            });
        },
        /options.gfm/,
        'should throw when `options.gfm` is not a boolean'
    );

    t.throws(
        function () {
            remark().parse('', {
                'footnotes': 1
            });
        },
        /options.footnotes/,
        'should throw when `options.footnotes` is not a boolean'
    );

    t.throws(
        function () {
            remark().parse('', {
                'breaks': 'unicorn'
            });
        },
        /options.breaks/,
        'should throw when `options.breaks` is not a boolean'
    );

    t.throws(
        function () {
            remark().parse('', {
                'pedantic': {}
            });
        },
        /options.pedantic/,
        'should throw when `options.pedantic` is not a boolean'
    );

    t.throws(
        function () {
            remark().parse('', {
                'yaml': [true]
            });
        },
        /options.yaml/,
        'should throw when `options.yaml` is not a boolean'
    );

    t.test('should throw parse errors', function (st) {
        var processor = remark();
        var message = 'Found it!';

        st.plan(5);

        /* Tokenizer. */
        function emphasis(eat, value) {
            if (value.charAt(0) === '*') {
                eat.file.fail(message, eat.now());
            }
        }

        /* Locator. */
        function locator(value, fromIndex) {
            return value.indexOf('*', fromIndex);
        }

        emphasis.locator = locator;
        processor.Parser.prototype.inlineTokenizers.emphasis = emphasis;

        try {
            processor.parse('Hello *World*!');
        } catch (err) {
            st.equal(err.file, '', 'should pass a filename');
            st.equal(err.line, 1, 'should set `line`');
            st.equal(err.column, 7, 'should set `column`');
            st.equal(err.reason, message, 'should set `reason`');

            st.equal(
                err.toString(),
                '1:7: ' + message,
                'should set `message`'
            );
        }
    });

    t.test('should warn when missing locators', function (st) {
        var processor = remark();
        var proto = processor.Parser.prototype;
        var methods = proto.inlineMethods;
        var file = new VFile('Hello *World*!');

        /* Tokenizer. */
        function noop() {}

        proto.inlineTokenizers.foo = noop;
        methods.splice(methods.indexOf('inlineText'), 0, 'foo');

        file.quiet = true;
        processor.parse(file);

        st.equal(
            String(file.messages[0]),
            '1:1: Missing locator: `foo`'
        );

        st.end();
    });

    t.test('should warn about entities', function (st) {
        var filePath = path.join('test', 'fixtures', 'input', 'entities-advanced.text');
        var doc = fs.readFileSync(filePath, 'utf8');
        var file = new VFile(doc);
        var notTerminated = 'Named character references must be ' +
            'terminated by a semicolon';

        file.quiet = true;

        remark().process(file);

        st.deepEqual(
            file.messages.map(String),
            [
                '1:13: Named character references must be known',
                '5:15: ' + notTerminated,
                '10:14: ' + notTerminated,
                '12:38: ' + notTerminated,
                '15:16: ' + notTerminated,
                '15:37: ' + notTerminated,
                '14:16: ' + notTerminated,
                '18:17: ' + notTerminated,
                '19:21: ' + notTerminated,
                '17:16: ' + notTerminated,
                '24:16: ' + notTerminated,
                '24:37: ' + notTerminated,
                '22:11: ' + notTerminated,
                '29:17: ' + notTerminated,
                '30:21: ' + notTerminated,
                '28:17: ' + notTerminated,
                '33:11: ' + notTerminated,
                '36:27: ' + notTerminated,
                '37:10: ' + notTerminated,
                '41:25: ' + notTerminated,
                '42:10: ' + notTerminated
            ]
        );

        st.end();
    });

    t.test('should be able to set options', function (st) {
        var processor = remark();
        var html = processor.Parser.prototype.blockTokenizers.html;
        var result;

        /* Set option when an HMTL comment occurs. */
        function replacement(eat, value) {
            var node = /<!--\s*(.*?)\s*-->/g.exec(value);
            var options = {};

            if (node) {
                options[node[1]] = true;

                this.setOptions(options);
            }

            return html.apply(this, arguments);
        }

        processor.Parser.prototype.blockTokenizers.html = replacement;

        result = processor.parse([
            '<!-- commonmark -->',
            '',
            '1)   Hello World',
            ''
        ].join('\n'));

        st.equal(result.children[1].type, 'list');

        st.end();
    });

    t.end();
});

/* Test `remark-stringify`. */
test('remark().stringify(ast, file, options?)', function (t) {
    t.throws(
        function () {
            remark().stringify(false);
        },
        /false/,
        'should throw when `ast` is not an object'
    );

    t.throws(
        function () {
            remark().stringify({
                'type': 'unicorn'
            });
        },
        /unicorn/,
        'should throw when `ast` is not a valid node'
    );

    t.throws(
        function () {
            remark().stringify(empty(), true);
        },
        /options/,
        'should throw when `options` is not an object'
    );

    t.throws(
        function () {
            remark().stringify(empty(), {
                'bullet': true
            });
        },
        /options\.bullet/,
        'should throw when `options.bullet` is not a valid list bullet'
    );

    t.throws(
        function () {
            remark().stringify(empty(), {
                'listItemIndent': 'foo'
            });
        },
        /options\.listItemIndent/,
        'should throw when `options.listItemIndent` is not a valid ' +
        'constant'
    );

    t.throws(
        function () {
            remark().stringify(empty(), {
                'rule': true
            });
        },
        /options\.rule/,
        'should throw when `options.rule` is not a valid ' +
        'horizontal rule bullet'
    );

    t.throws(
        function () {
            remark().stringify(empty(), {
                'ruleSpaces': 1
            });
        },
        /options\.ruleSpaces/,
        'should throw when `options.ruleSpaces` is not a boolean'
    );

    t.throws(
        function () {
            remark().stringify(empty(), {
                'ruleRepetition': 1
            });
        },
        /options\.ruleRepetition/,
        'should throw when `options.ruleRepetition` is too low'
    );

    t.throws(
        function () {
            remark().stringify(empty(), {
                'ruleRepetition': NaN
            });
        },
        /options\.ruleRepetition/,
        'should throw when `options.ruleRepetition` is `NaN`'
    );

    t.throws(
        function () {
            remark().stringify(empty(), {
                'ruleRepetition': true
            });
        },
        /options\.ruleRepetition/,
        'should throw when `options.ruleRepetition` is not a number'
    );

    t.throws(
        function () {
            remark().stringify(empty(), {
                'emphasis': '-'
            });
        },
        /options\.emphasis/,
        'should throw when `options.emphasis` is not a ' +
        'valid emphasis marker'
    );

    t.throws(
        function () {
            remark().stringify(empty(), {
                'strong': '-'
            });
        },
        /options\.strong/,
        'should throw when `options.strong` is not a ' +
        'valid emphasis marker'
    );

    t.throws(
        function () {
            remark().stringify(empty(), {
                'setext': 0
            });
        },
        /options\.setext/,
        'should throw when `options.setext` is not a boolean'
    );

    t.throws(
        function () {
            remark().stringify(empty(), {
                'incrementListMarker': -1
            });
        },
        /options\.incrementListMarker/,
        'should throw when `options.incrementListMarker` is not a ' +
        'boolean'
    );

    t.throws(
        function () {
            remark().stringify(empty(), {
                'fences': NaN
            });
        },
        /options\.fences/,
        'should throw when `options.fences` is not a boolean'
    );

    t.throws(
        function () {
            remark().stringify(empty(), {
                'fence': '-'
            });
        },
        /options\.fence/,
        'should throw when `options.fence` is not a ' +
        'valid fence marker'
    );

    t.throws(
        function () {
            remark().stringify(empty(), {
                'closeAtx': NaN
            });
        },
        /options\.closeAtx/,
        'should throw when `options.closeAtx` is not a boolean'
    );

    t.throws(
        function () {
            remark().stringify(empty(), {
                'looseTable': 'Hello!'
            });
        },
        /options\.looseTable/,
        'should throw when `options.looseTable` is not a boolean'
    );

    t.throws(
        function () {
            remark().stringify(empty(), {
                'spacedTable': 'World'
            });
        },
        /options\.spacedTable/,
        'should throw when `options.spacedTable` is not a boolean'
    );

    t.test('should be able to set options', function (st) {
        var processor = remark();
        var html = processor.Compiler.prototype.visitors.html;
        var ast;

        ast = processor.parse([
            '<!-- setext -->',
            '',
            '# Hello World',
            ''
        ].join('\n'));

        /* Set option when an HMTL comment occurs */
        function replacement(node) {
            var value = node.value;
            var result = /<!--\s*(.*?)\s*-->/g.exec(value);
            var options = {};

            if (result) {
                options[result[1]] = true;

                this.setOptions(options);
            }

            return html.apply(this, arguments);
        }

        processor.Compiler.prototype.visitors.html = replacement;

        st.equal(
            processor.stringify(ast),
            [
                '<!-- setext -->',
                '',
                'Hello World',
                '===========',
                ''
            ].join('\n')
        );

        st.end();
    });

    t.end();
});

/* Test `remark`. */
test('remark().process(value, options, done)', function (t) {
    t.equal(
        remark().process('*foo*').toString(),
        '_foo_\n',
        'should parse and stringify a file'
    );

    t.equal(
        remark().process('1)  foo', {
            'commonmark': true
        }).toString(),
        '1.  foo\n',
        'should accept parse options'
    );

    t.equal(
        remark().process('# foo', {
            'closeAtx': true
        }).toString(),
        '# foo #\n',
        'should accept stringify options'
    );

    t.throws(
        function () {
            remark().process([
                '* List',
                '',
                '        code()'
            ].join('\n'), {
                'pedantic': true,
                'listItemIndent': '1'
            });
        },
        /Cannot indent code properly. See http:\/\/git.io\/vgFvT/,
        'should throw when `pedantic` is `true`, `listItemIndent` ' +
        'is not `tab`, and compiling code in a list-item'
    );

    t.end();
});

/**
 * Compress array of nodes by merging adjacent text nodes when possible.
 *
 * This usually happens inside Parser, but it also needs to be done whenever
 * position info is stripped from the AST.
 *
 * @param {Array.<Object>} nodes - Nodes to merge.
 * @return {Array.<Object>} - Merged nodes.
 */
function mergeTextNodes(nodes) {
    if (!nodes.length || nodes[0].position) {
        return nodes;
    }

    var result = [nodes[0]];

    nodes.slice(1).forEach(function (node) {
        if (node.type == 'text' && result[result.length - 1].type == 'text') {
            result[result.length - 1].value += node.value;
        } else {
            result.push(node);
        }
    });

    return result;
}

/**
 * Clone, and optionally clean from `position`, a node.
 *
 * @param {Object} node - Node to clone.
 * @param {boolean} clean - Whether to clean.
 * @return {Object} - Cloned node.
 */
function clone(node, clean) {
    var result = Array.isArray(node) ? [] : {};

    Object.keys(node).forEach(function (key) {
        var value = node[key];

        if (value === undefined) {
            return;
        }

        /*
         * Remove `position` when needed.
         */

        if (clean && key === 'position') {
            return;
        }

        if (value === null || typeof value !== 'object') {
            result[key] = value;
        } else {
            result[key] = clone(value, clean);

            if (key === 'children') {
                result[key] = mergeTextNodes(result[key]);
            }
        }
    });

    return result;
}

/*
 * Methods.
 */

/**
 * Diff node.
 *
 * @param {Test} t - Test.
 * @param {string} name - Assertion name.
 * @param {Node} node - Node to diff.
 * @param {Node} baseline - Baseline reference.
 * @param {boolean} clean - Whether to clean `node`.
 * @param {boolean} cleanBaseline - Whether to clean
 *   `baseline`.
 */
function compare(t, name, node, baseline, clean, cleanBaseline) {
    mdast(node);

    if (clean && !cleanBaseline) {
        cleanBaseline = true;
    }

    t.deepEqual(
        clone(node, clean),
        clone(baseline, cleanBaseline),
        name
    );
}

/* Test all fixtures. */
test('fixtures', function (t) {
    var index = -1;

    /* Check the next fixture. */
    function next() {
        var fixture = fixtures[++index];

        if (!fixture) {
            t.end();
        } else {
            setImmediate(next); // queue next.

            t.test(fixture.name, function (st) {
                var input = fixture.input;
                var possibilities = fixture.possibilities;
                var mapping = fixture.mapping;
                var trees = fixture.trees;
                var output = fixture.output;

                Object.keys(possibilities).forEach(function (key) {
                    var name = key || 'default';
                    var parse = possibilities[key];
                    var initialClean = !parse.position;
                    var stringify;
                    var node;
                    var markdown;

                    stringify = extend({}, fixture.stringify, {
                        'gfm': parse.gfm,
                        'commonmark': parse.commonmark,
                        'pedantic': parse.pedantic
                    });

                    node = remark().parse(input, parse);

                    /*
                     * The first assertion should not clean positional
                     * information, except when `position: false`: in that
                     * case the baseline should be stripped of positional
                     * information.
                     */

                    compare(
                        st,
                        'should parse `' + name + '` correctly',
                        node,
                        trees[mapping[key]],
                        false,
                        initialClean
                    );

                    markdown = remark().stringify(node, stringify);

                    if (output !== false) {
                        compare(
                            st,
                            'should stringify `' + name + '`',
                            node,
                            remark().parse(markdown, parse),
                            true
                        );
                    }

                    if (output === true) {
                        st.equal(
                            fixture.input,
                            markdown,
                            'should stringify `' + name + '` exact'
                        );
                    }
                });

                st.end();
            });
        }
    }

    next();
});
