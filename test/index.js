'use strict';

var mdast = require('..');
var assert = require('assert');
var fixtures = require('./fixtures.js');
var chalk = require('chalk');
var diff = require('diff');
var badges = require('./badges.js');
var mentions = require('./mentions.js');

/*
 * Settings.
 */

var INDENT = 2;

/**
 * No-operation.
 */
function noop() {}

/**
 * Construct an empty node.
 *
 * @return {Object}
 */
function empty() {
    return {
        'type': 'root',
        'children': []
    };
}

/*
 * Tests.
 */

describe('mdast', function () {
    it('should be an `object`', function () {
        assert(typeof mdast === 'object');
    });
});

describe('mdast.parse(value, options, CustomParser)', function () {
    it('should be a `function`', function () {
        assert(typeof mdast.parse === 'function');
    });

    it('should throw when `value` is not a string', function () {
        assert.throws(function () {
            mdast.parse(false);
        }, /false/);
    });

    it('should throw when `options` is not an object', function () {
        assert.throws(function () {
            mdast.parse('', false);
        }, /options/);
    });

    it('should throw when `options.gfm` is not a boolean', function () {
        assert.throws(function () {
            mdast.parse('', {
                'gfm': Infinity
            });
        }, /options.gfm/);
    });

    it('should throw when `options.footnotes` is not a boolean', function () {
        assert.throws(function () {
            mdast.parse('', {
                'footnotes': 1
            });
        }, /options.footnotes/);
    });

    it('should throw when `options.breaks` is not a boolean', function () {
        assert.throws(function () {
            mdast.parse('', {
                'breaks': 'unicorn'
            });
        }, /options.breaks/);
    });

    it('should throw when `options.pedantic` is not a boolean', function () {
        assert.throws(function () {
            mdast.parse('', {
                'pedantic': {}
            });
        }, /options.pedantic/);
    });

    it('should throw when `options.yaml` is not a boolean', function () {
        assert.throws(function () {
            mdast.parse('', {
                'yaml': [true]
            });
        }, /options.yaml/);
    });

    it('should not accept inherited properties', function () {
        /**
         * Fixture for inherited options.
         */
        function CustomOptions() {}

        CustomOptions.prototype.gfm = 'Invalid and inherited.';

        assert.doesNotThrow(function () {
            mdast.parse('', new CustomOptions());
        });
    });

    it('should accept a `CustomParser` as a third argument', function () {
        var isInvoked;
        var Parser = mdast.parse.Parser;
        var proto;

        /**
         * Extensible prototype.
         */
        function Proto() {}

        Proto.prototype = Parser.prototype;

        proto = new Proto();

        /**
         * Mock `parse`.
         */
        function parse() {
            isInvoked = true;

            return {};
        }

        /**
         * Construct a parser.
         *
         * @constructor {CustomParser}
         */
        function CustomParser() {
            return Parser.apply(this, arguments);
        }

        CustomParser.prototype = proto;

        CustomParser.prototype.parse = parse;

        mdast.parse('', null, CustomParser);

        assert(isInvoked === true);
    });
});

describe('mdast.stringify(ast, options, CustomCompiler)', function () {
    it('should be a `function`', function () {
        assert(typeof mdast.stringify === 'function');
    });

    it('should throw when `ast` is not an object', function () {
        assert.throws(function () {
            mdast.stringify(false);
        }, /false/);
    });

    it('should throw when `ast` is not a valid node', function () {
        assert.throws(function () {
            mdast.stringify({
                'type': 'unicorn'
            });
        }, /unicorn/);
    });

    it('should throw when `options` is not an object', function () {
        assert.throws(function () {
            mdast.stringify(empty(), false);
        }, /options/);
    });

    it('should throw when `options.bullet` is not a valid list bullet',
        function () {
            assert.throws(function () {
                mdast.stringify(empty(), {
                    'bullet': true
                });
            }, /options\.bullet/);
        }
    );

    it('should throw when `options.rule` is not a valid ' +
        'horizontal rule bullet',
        function () {
            assert.throws(function () {
                mdast.stringify(empty(), {
                    'rule': true
                });
            }, /options\.rule/);
        }
    );

    it('should throw when `options.ruleSpaces` is not a boolean',
        function () {
            assert.throws(function () {
                mdast.stringify(empty(), {
                    'ruleSpaces': 1
                });
            }, /options\.ruleSpaces/);
        }
    );

    it('should throw when `options.ruleRepetition` is not a ' +
        'valid repetition count',
        function () {
            assert.throws(function () {
                mdast.stringify(empty(), {
                    'ruleRepetition': 1
                });
            }, /options\.ruleRepetition/);

            assert.throws(function () {
                mdast.stringify(empty(), {
                    'ruleRepetition': NaN
                });
            }, /options\.ruleRepetition/);

            assert.throws(function () {
                mdast.stringify(empty(), {
                    'ruleRepetition': true
                });
            }, /options\.ruleRepetition/);
        }
    );

    it('should throw when `options.emphasis` is not a ' +
        'valid emphasis marker',
        function () {
            assert.throws(function () {
                mdast.stringify(empty(), {
                    'emphasis': '-'
                });
            }, /options\.emphasis/);
        }
    );

    it('should throw when `options.strong` is not a ' +
        'valid emphasis marker',
        function () {
            assert.throws(function () {
                mdast.stringify(empty(), {
                    'strong': '-'
                });
            }, /options\.strong/);
        }
    );

    it('should throw when `options.setext` is not a boolean',
        function () {
            assert.throws(function () {
                mdast.stringify(empty(), {
                    'setext': 0
                });
            }, /options\.setext/);
        }
    );

    it('should throw when `options.referenceLinks` is not a boolean',
        function () {
            assert.throws(function () {
                mdast.stringify(empty(), {
                    'referenceLinks': Infinity
                });
            }, /options\.referenceLinks/);
        }
    );

    it('should throw when `options.fences` is not a boolean',
        function () {
            assert.throws(function () {
                mdast.stringify(empty(), {
                    'fences': NaN
                });
            }, /options\.fences/);
        }
    );

    it('should throw when `options.fence` is not a ' +
        'valid fence marker',
        function () {
            assert.throws(function () {
                mdast.stringify(empty(), {
                    'fence': '-'
                });
            }, /options\.fence/);
        }
    );

    it('should throw when `options.closeAtx` is not a boolean', function () {
        assert.throws(function () {
            mdast.stringify(empty(), {
                'closeAtx': NaN
            });
        }, /options\.closeAtx/);
    });

    it('should throw when `options.looseTable` is not a boolean',
        function () {
            assert.throws(function () {
                mdast.stringify(empty(), {
                    'looseTable': 'Hello!'
                });
            }, /options\.looseTable/);
        }
    );

    it('should throw when `options.spacedTable` is not a boolean',
        function () {
            assert.throws(function () {
                mdast.stringify(empty(), {
                    'spacedTable': 'World'
                });
            }, /options\.spacedTable/);
        }
    );

    it('should not accept inherited properties', function () {
        /**
         * Fixture for inherited options.
         */
        function CustomOptions() {}

        /*
         * An inherited invalid `fence` option.
         */

        CustomOptions.prototype.fence = '-';

        assert.doesNotThrow(function () {
            mdast.stringify(empty(), new CustomOptions());
        });
    });

    it('should accept a `CustomCompiler` as a third argument', function () {
        var isInvoked;

        /**
         * Construct a compiler.
         *
         * @constructor {CustomCompiler}
         */
        function CustomCompiler() {
            return mdast.stringify.Compiler.apply(this, arguments);
        }

        /**
         * Mock `visit`.
         */
        function visit() {
            isInvoked = true;

            return '';
        }

        CustomCompiler.prototype.visit = visit;

        mdast.stringify(empty(), null, CustomCompiler);

        assert(isInvoked === true);
    });
});

describe('mdast.use(plugin)', function () {
    it('should be a `function`', function () {
        assert(typeof mdast.use === 'function');
    });

    it('should accept a function', function () {
        mdast.use(noop);
    });

    it('should return an instance of mdast', function () {
        var parser = mdast.use(noop);

        assert(mdast.use(noop) instanceof parser.constructor);
    });

    it('should attach a plugin', function () {
        var parser = mdast.use(noop);

        assert(parser.ware.fns.length === 1);
    });

    it('should multiple plugins', function () {
        var parser = mdast.use(noop).use(noop);

        assert(parser.ware.fns.length === 2);
    });

    it('should invoke a plugin when `parse()` is invoked', function () {
        var isInvoked;
        var settings;

        settings = {
            'hello': 'world'
        };

        /**
         * Thrower.
         */
        function assertion(ast, options) {
            assert(ast.type === 'root');
            assert(options === settings);

            isInvoked = true;
        }

        mdast.use(assertion).parse('# Hello world', settings);

        assert(isInvoked === true);
    });

    it('should fail if an exception occurs in `plugin`', function () {
        var exception = new Error('test');

        assert.throws(function () {
            mdast.use(function () {
                throw exception;
            }).parse('');
        }, /test/);
    });

    it('should invoke a plugin’s `attach` method', function () {
        var exception = new Error('test');

        /**
         * Plugin.
         */
        function test() {}

        /**
         * Thrower.
         */
        function attach() {
            throw exception;
        }

        test.attach = attach;

        assert.throws(function () {
            mdast.use(test);
        }, /test/);
    });

    it('should work on an example plugin', function () {
        var parser = mdast.use(badges);

        var source = parser.stringify(parser.parse('# mdast'));

        assert(
            source === '# mdast [' +
            '![Version](http://img.shields.io/npm/v/mdast.svg)' +
            '](https://www.npmjs.com/package/mdast)\n'
        );

        source = parser.stringify(parser.parse('# mdast', {
            'flat': true
        }));

        assert(
            source === '# mdast [' +
            '![Version](http://img.shields.io/npm/v/mdast.svg?style=flat)' +
            '](https://www.npmjs.com/package/mdast)\n'
        );
    });
});

describe('mdast.run(ast, options)', function () {
    it('should be a `function`', function () {
        assert(typeof mdast.run === 'function');
    });

    it('should accept an ast', function () {
        mdast.run(empty());
    });

    it('should accept options', function () {
        mdast.run(empty(), {});
    });

    it('should return the given ast', function () {
        var node = empty();

        assert(node === mdast.run(node, {}));
    });

    it('should invoke a plugin', function () {
        var node = empty();
        var isInvoked;
        var settings;

        settings = {
            'hello': 'world'
        };

        /**
         * Assertion.
         */
        function assertion(ast, options) {
            assert(ast === node);
            assert(options === settings);

            isInvoked = true;
        }

        mdast.use(assertion).run(node, settings);

        assert(isInvoked === true);
    });

    it('should work without plugins', function () {
        mdast.run(empty());
    });

    it('should work on an example plugin', function () {
        var parser = mdast.use(badges);
        var nodeA = mdast.parse('# mdast');
        var nodeB = mdast.parse('# mdast');

        var source = parser.stringify(parser.run(nodeA));

        assert(
            source === '# mdast [' +
            '![Version](http://img.shields.io/npm/v/mdast.svg)' +
            '](https://www.npmjs.com/package/mdast)\n'
        );

        source = parser.stringify(parser.run(nodeB, {
            'flat': true
        }));

        assert(
            source === '# mdast [' +
            '![Version](http://img.shields.io/npm/v/mdast.svg?style=flat)' +
            '](https://www.npmjs.com/package/mdast)\n'
        );
    });
});

describe('function plugin(ast, options, context) {}', function () {
    it('should be able to modify `Parser` without affecting ' +
        'other instances of mdast',
        function () {
            var doc = 'Hello w/ a @mention!\n';
            var output1 = mdast.stringify(mdast.use(mentions).parse(doc));
            var output2 = mdast.stringify(mdast.parse(doc));

            assert(
                output1 === 'Hello w/ a ' +
                '[@mention](https://github.com/blog/821)!\n'
            );

            assert(output2 === doc);
        }
    );
});

var validateToken;
var validateTokens;

/**
 * Validate `children`.
 *
 * @param {Array.<Object>} children
 */
validateTokens = function (children) {
    children.forEach(validateToken);
};

/**
 * Validate `context`.
 *
 * @param {Object} context
 */
validateToken = function (context) {
    var keys = Object.keys(context).length;
    var type = context.type;
    var key;

    assert('type' in context);

    if ('children' in context) {
        assert(Array.isArray(context.children));
        validateTokens(context.children);
    }

    /*
     * Validate position.
     */

    if (type !== 'footnoteDefinition' || 'position' in context) {
        assert('position' in context);

        assert('start' in context.position);
        assert('end' in context.position);

        assert('line' in context.position.start);
        assert('column' in context.position.start);

        assert('line' in context.position.end);
        assert('column' in context.position.end);

        keys--;
    }

    if ('value' in context) {
        assert(typeof context.value === 'string');
    }

    if (type === 'root') {
        assert('children' in context);

        if (context.footnotes) {
            for (key in context.footnotes) {
                validateToken(context.footnotes[key]);
            }
        }

        return;
    }

    if (
        type === 'paragraph' ||
        type === 'blockquote' ||
        type === 'tableHeader' ||
        type === 'tableRow' ||
        type === 'tableCell' ||
        type === 'strong' ||
        type === 'emphasis' ||
        type === 'delete'
    ) {
        assert(keys === 2);
        assert('children' in context);

        return;
    }

    if (type === 'listItem') {
        assert(keys === 3 || keys === 4);
        assert('children' in context);
        assert('loose' in context);

        if (keys === 4) {
            assert(
                context.checked === true ||
                context.checked === false ||
                context.checked === null
            );
        }

        return;
    }

    if (type === 'footnote') {
        assert(keys === 2);
        assert('id' in context);

        return;
    }

    if (type === 'heading') {
        assert(keys === 3);
        assert(context.depth > 0);
        assert(context.depth <= 6);
        assert('children' in context);

        return;
    }

    if (
        type === 'text' ||
        type === 'escape' ||
        type === 'inlineCode' ||
        type === 'yaml'
    ) {
        assert(keys === 2);
        assert('value' in context);

        return;
    }

    if (type === 'code') {
        assert(keys === 3);
        assert('value' in context);

        assert(
            context.lang === null ||
            typeof context.lang === 'string'
        );

        return;
    }

    if (type === 'horizontalRule' || type === 'break') {
        assert(keys === 1);

        return;
    }

    if (type === 'list') {
        assert('children' in context);
        assert(typeof context.ordered === 'boolean');
        assert(keys === 3);

        return;
    }

    if (type === 'footnoteDefinition') {
        assert(keys === 3);
        assert('children' in context);
        assert('id' in context);

        return;
    }

    if (type === 'link') {
        assert('children' in context);
        assert(
            context.title === null ||
            typeof context.title === 'string'
        );
        assert(typeof context.href === 'string');
        assert(keys === 4);

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
        assert(keys === 4);

        return;
    }

    if (type === 'table') {
        assert(keys === 3);
        assert('children' in context);

        assert(Array.isArray(context.align));

        context.align.forEach(function (align) {
            assert(
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
    assert(type === 'html');
    assert(keys === 2);
    assert('value' in context);
};

/**
 * Clone, and optionally clean from `position`, a node.
 *
 * @param {Object} node
 * @param {boolean} clean
 * @return {Object}
 */
function clone(node, clean) {
    var result = Array.isArray(node) ? [] : {};

    Object.keys(node).forEach(function (key) {
        var value = node[key];

        if (clean) {
            if (key === 'position') {
                return;
            }
        }

        if (key === 'footnotes' && Object.keys(value).length === 0) {
            return;
        }

        if (key === 'checked' && value === null) {
            return;
        }

        if (value !== null && typeof value === 'object') {
            result[key] = clone(value, clean);
        } else {
            result[key] = value;
        }
    });

    return result;
}

/*
 * Methods.
 */

var stringify = JSON.stringify;

/**
 * Diff node.
 *
 * @param {Object} node
 * @param {Object} baseline
 * @param {boolean} clean
 */
function compare(node, baseline, clean) {
    validateToken(node);

    try {
        assert.deepEqual(clone(node, clean), clone(baseline, clean));
    } catch (error) {
        /* istanbul ignore next */
        logDifference(
            stringify(clone(baseline, clean), null, INDENT),
            stringify(clone(node, clean), null, INDENT)
        );

        /* istanbul ignore next */
        throw error;
    }
}

/**
 * Diff text.
 *
 * @param {string} value
 * @param {string} baseline
 */
function compareText(value, baseline) {
    try {
        assert(value === baseline);
    } catch (error) {
        /* istanbul ignore next */
        logDifference(baseline, value);

        /* istanbul ignore next */
        throw error;
    }
}

/*
 * Fixtures.
 */

describe('fixtures', function () {
    fixtures.forEach(function (fixture) {
        describe(fixture.name, function () {
            var input = fixture.input;
            var possibilities = fixture.possibilities;
            var mapping = fixture.mapping;
            var trees = fixture.trees;
            var output = fixture.output;

            Object.keys(possibilities).forEach(function (key) {
                var name = key || 'default';
                var parse = possibilities[key];
                var node = mdast.parse(input, parse);
                var markdown = mdast.stringify(node, fixture.stringify);

                it('should parse `' + name + '` correctly', function () {
                    compare(node, trees[mapping[key]], false);
                });

                if (output !== false) {
                    it('should stringify `' + name + '`', function () {
                        compare(node, mdast.parse(markdown, parse), true);
                    });
                }

                if (output === true) {
                    it('should stringify `' + name + '` exact', function () {
                        compareText(fixture.input, markdown);
                    });
                }
            });
        });
    });
});

/* istanbul ignore next */

/**
 * Log the difference between `value` and `alternative`.
 *
 * @param {string} value
 * @param {string} alternative
 */
function logDifference(value, alternative) {
    var difference = diff.diffLines(value, alternative);

    if (difference && difference.length) {
        difference.forEach(function (change, index) {
            var colour;
            var changes;
            var start;
            var end;

            colour = change.added ? 'green' : change.removed ? 'red' : 'dim';

            changes = change.value;

            if (colour === 'dim') {
                changes = changes.split('\n');

                if (changes.length > 6) {
                    start = changes.slice(0, 3);
                    end = changes.slice(-3);

                    if (index === 0) {
                        start = [];
                    } else if (index === difference.length - 1) {
                        end = [];
                    }

                    changes = start.concat('...', end);
                }

                changes = changes.join('\n');
            }

            process.stdout.write(chalk[colour](changes));
        });
    }
}
