'use strict';

var mdast = require('..');
var assert = require('assert');
var fixtures = require('./fixtures.js');
var chalk = require('chalk');
var diff = require('diff');
var plugin = require('./plugin.js');

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

    it('should throw when `options.tables` is not a boolean', function () {
        assert.throws(function () {
            mdast.parse('', {
                'tables': Math
            });
        }, /options.tables/);
    });

    it('should throw when `options.tables` is true and ' +
        '`options.gfm` is false',
        function () {
            assert.throws(function () {
                mdast.parse('', {
                    'gfm': false,
                    'tables': true
                });
            }, /options.tables/);
        }
    );

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

        /**
         * Construct a parser.
         *
         * @constructor {CustomParser}
         */
        function CustomParser() {
            return mdast.parse.Parser.apply(this, arguments);
        }

        /**
         * Mock `parse`.
         */
        function parse() {
            isInvoked = true;

            return {};
        }

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

describe('mdast.use(function(plugin))', function () {
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

    it('should work on an example plugin', function () {
        var parser = mdast.use(plugin);
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
        assert(keys === 3);
        assert('children' in context);
        assert('loose' in context);

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

/*
 * Fixtures.
 */

describe('fixtures', function () {
    fixtures.forEach(function (fixture) {
        var baseline = JSON.parse(fixture.tree);
        var node;
        var markdown;

        it('should parse `' + fixture.name + '` correctly', function () {
            node = mdast.parse(fixture.input, fixture.options);

            validateToken(node);

            try {
                assert.deepEqual(clone(node), clone(baseline));
            } catch (error) {
                /* istanbul ignore next */
                logDifference(
                    stringify(clone(baseline), null, INDENT),
                    stringify(clone(node), null, INDENT)
                );

                /* istanbul ignore next */
                throw error;
            }
        });

        if (!fixture.options || fixture.options.output !== false) {
            it('should stringify `' + fixture.name + '`', function () {
                var result;

                markdown = mdast.stringify(node, fixture.options);
                result = mdast.parse(markdown, fixture.options);

                try {
                    assert.deepEqual(clone(node, true), clone(result, true));
                } catch (error) {
                    /* istanbul ignore next */
                    logDifference(
                        stringify(clone(node, true), null, INDENT),
                        stringify(clone(result, true), null, INDENT)
                    );

                    /* istanbul ignore next */
                    throw error;
                }
            });
        }

        if (fixture.output) {
            it('should stringify `' + fixture.name + '` to its input',
                function () {
                    try {
                        assert(fixture.input === markdown);
                    } catch (error) {
                        /* istanbul ignore next */
                        logDifference(fixture.input, markdown);

                        /* istanbul ignore next */
                        throw error;
                    }
                }
            );
        }
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
    var difference;

    difference = diff.diffLines(value, alternative);

    if (difference && difference.length) {
        difference.forEach(function (change) {
            var colour;

            colour = change.added ? 'green' : change.removed ? 'red' : 'dim';

            process.stdout.write(chalk[colour](change.value));
        });
    }
}
