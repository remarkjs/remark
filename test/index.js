'use strict';

/* eslint-env mocha */

var assert = require('assert');
var he = require('he');
var mdast = require('..');
var File = require('../lib/file.js');
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
 * No-operation plugin.
 *
 * @return {Function} - `noop`.
 */
function plugin() {
    return noop;
}

/**
 * Delayed no-operation transformer.
 */
function asyncTransformer(ast, file, next) {
    setTimeout(function () {
        next();
    }, 4);
}

/**
 * Delayed no-operation plugin.
 *
 * @return {Function} - `asyncTransformer`.
 */
function asyncAttacher() {
    return asyncTransformer;
}

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

describe('mdast.parse(file, options?)', function () {
    it('should accept a `string`', function () {
        assert(mdast.parse('Alfred').children.length === 1);
    });

    it('should throw when `options` is not an object', function () {
        assert.throws(function () {
            mdast.parse('', false);
        }, /options/);
    });

    it('should throw when `options.position` is not a boolean', function () {
        assert.throws(function () {
            mdast.parse('', {
                'position': 0
            });
        }, /options.position/);
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

    it('should throw parse errors', function () {
        var processor = mdast();
        var message = 'Found it!';
        var hasThrown;

        /**
         * Tokenizer.
         */
        function emphasis(eat) {
            eat.file.fail(message, eat.now());
        }

        processor.Parser.prototype.inlineTokenizers.emphasis = emphasis;

        try {
            processor.parse('Hello *World*!');
        } catch (exception) {
            hasThrown = true;

            assert(exception.file === '');
            assert(exception.line === 1);
            assert(exception.column === 7);
            assert(exception.reason === message);
            assert(exception.toString() === '1:7: ' + message);
        }

        assert(hasThrown === true);
    });

    it('should throw `he` errors', function () {
        var reason = 'Parse error: named character reference was ' +
            'not terminated by a semicolon';
        var hasThrown;

        he.decode.options.strict = true;

        try {
            mdast.parse('Hello&amp.');
        } catch (exception) {
            hasThrown = true;

            assert(exception.file === '');
            assert(exception.line === 1);
            assert(exception.column === 11);
            assert(exception.reason === reason);
            assert(exception.toString() === '1:11: ' + reason);
        }

        assert(hasThrown === true);

        he.decode.options.strict = false;
    });

    it('should be able to set options', function () {
        var processor = mdast();
        var html = processor.Parser.prototype.blockTokenizers.html;
        var result;

        /**
         * Set option when an HMTL comment occurs:
         * `<!-- $key -->`, turns on `$key`.
         *
         * @param {function(string)} eat
         * @param {string} $0
         */
        function replacement(eat, $0) {
            var token = /<!--\s*(.*?)\s*-->/g.exec($0);
            var options = {};

            if (token) {
                options[token[1]] = true;

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

        assert(result.children[1].type === 'list');
    });
});

describe('mdast.stringify(ast, file, options?)', function () {
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

    it('should throw when `options.listItemIndent` is not a valid ' +
        'constant',
        function () {
            assert.throws(function () {
                mdast.stringify(empty(), {
                    'listItemIndent': 'foo'
                });
            }, /options\.listItemIndent/);
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

    it('should throw when `options.incrementListMarker` is not a boolean',
        function () {
            assert.throws(function () {
                mdast.stringify(empty(), {
                    'incrementListMarker': -1
                });
            }, /options\.incrementListMarker/);
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

    it('should be able to set options', function () {
        var processor = mdast();
        var html = processor.Compiler.prototype.html;
        var ast;

        ast = processor.parse([
            '<!-- setext -->',
            '',
            '# Hello World',
            ''
        ].join('\n'));

        /**
         * Set option when an HMTL comment occurs:
         * `<!-- $key -->`, turns on `$key`.
         *
         * @param {Object} token
         * @return {string}
         */
        function replacement(token) {
            var value = token.value;
            var result = /<!--\s*(.*?)\s*-->/g.exec(value);
            var options = {};

            if (result) {
                options[result[1]] = true;

                this.setOptions(options);
            }

            return html.apply(this, arguments);
        }

        processor.Compiler.prototype.html = replacement;

        assert(processor.stringify(ast) === [
            '<!-- setext -->',
            '',
            'Hello World',
            '===========',
            ''
        ].join('\n'));
    });

    it('should throw `he` errors', function () {
        var reason = 'Parse error: forbidden code point';
        var hasThrown;

        he.encode.options.strict = true;

        try {
            mdast.stringify({
                'type': 'text',
                'value': '\x01',
                'position': {
                    'start': {
                        'line': 2,
                        'column': 3
                    },
                    'end': {
                        'line': 2,
                        'column': 4
                    }
                }
            }, new File(), {
                'entities': true
            });
        } catch (exception) {
            hasThrown = true;

            assert(exception.file === '');
            assert(exception.line === 2);
            assert(exception.column === 3);
            assert(exception.reason === reason);
            assert(exception.toString() === '2:3-2:4: ' + reason);
        }

        assert(hasThrown === true);

        he.decode.options.strict = false;
    });
});

describe('mdast.use(plugin, options?)', function () {
    it('should accept an attacher', function () {
        mdast.use(noop);
    });

    it('should accept multiple attachers', function () {
        mdast.use([function () {}, function () {}]);
    });

    it('should attach multiple attachers in the correct order', function () {
        var order = [];

        mdast.use([function () {
            order.push(1);
        }, function () {
            order.push(2);
        }]);

        assert.deepEqual(order, [1, 2]);
    });

    it('should return an instance of mdast', function () {
        var processor = mdast.use(noop);

        assert(mdast.use(noop) instanceof processor.constructor);
    });

    it('should attach an attacher', function () {
        var processor = mdast.use(noop);

        assert(processor.attachers.length === 1);
    });

    it('should attach a transformer', function () {
        var processor = mdast.use(plugin);

        assert(processor.ware.fns.length === 1);
    });

    it('should attach multiple attachers', function () {
        var processor = mdast.use(function () {}).use(function () {});

        assert(processor.attachers.length === 2);
    });

    it('should not attach the same attacher multiple times', function () {
        var processor = mdast.use(plugin).use(plugin);

        assert(processor.attachers.length === 1);
    });

    it('should attach multiple transformers', function () {
        var processor;

        /**
         * Transformer.
         */
        processor = mdast.use(function () {
            return function () {};
        }).use(function () {
            return function () {};
        });

        assert(processor.ware.fns.length === 2);
    });

    it('should attach the same transformer multiple times', function () {
        var processor;

        /**
         * Transformer.
         */
        function transformer() {}

        processor = mdast.use(function () {
            return transformer;
        }).use(function () {
            return transformer;
        });

        assert(processor.ware.fns.length === 2);
    });

    it('should invoke an attacher when `use()` is invoked', function () {
        var options = {};
        var isInvoked;

        /**
         * Attacher.
         */
        function assertion(processor, settings) {
            assert('use' in processor);
            assert(settings === options);

            isInvoked = true;
        }

        mdast.use(assertion, options);

        assert(isInvoked === true);
    });

    it('should fail if an exception occurs in an attacher', function () {
        var exception = new Error('test');

        /**
         * Thrower.
         */
        function thrower() {
            throw exception;
        }

        assert.throws(function () {
            mdast.use(thrower);
        }, /test/);
    });
});

describe('mdast.run(ast, file?, done?)', function () {
    it('should accept an ast', function () {
        mdast.run(empty());
    });

    it('should throw when `ast` is not an AST', function () {
        assert.throws(function () {
            mdast.run(false);
        }, /false/);
    });

    it('should accept a `file`', function () {
        mdast.run(empty(), new File());
    });

    it('should return the given ast', function () {
        var node = empty();

        assert(node === mdast.run(node));
    });

    it('should accept a `done` callback, without file', function (done) {
        mdast.run(empty(), function (err) {
            done(err);
        });
    });

    it('should accept a `done` callback', function (done) {
        mdast.run(empty(), {
            'filename': 'Untitled',
            'extension': 'md',
            'contents': ''
        }, function (err) {
            done(err);
        });
    });
});

describe('mdast.process(value, options, done)', function () {
    it('should parse and stringify a file', function () {
        assert(mdast.process('*foo*') === '_foo_\n');
    });

    it('should accept parse options', function () {
        assert(mdast.process('1)  foo', {
            'commonmark': true
        }) === '1.  foo\n');
    });

    it('should accept stringify options', function () {
        assert(mdast.process('# foo', {
            'closeAtx': true
        }) === '# foo #\n');
    });

    it('should run plugins', function () {
        assert(
            mdast.use(mentions).process('@mention') ===
            '[@mention](https://github.com/blog/821)\n'
        );
    });

    it('should run async plugins', function (done) {
        mdast.use(asyncAttacher).process('Foo', function (err) {
            done(err);
        });
    });

    it('should pass an async error', function (done) {
        var exception = new Error('test');

        /**
         * Transformer.
         */
        function transformer(ast, file, next) {
            setTimeout(function () {
                next(exception);
            }, 4);
        }

        /**
         * Attacher.
         */
        function attacher() {
            return transformer;
        }

        mdast.use(attacher).process('Foo', function (err) {
            assert(err === exception);
            done();
        });
    });

    it('should throw an error', function () {
        var exception = new Error('test');

        /**
         * Transformer.
         */
        function transformer() {
            throw exception;
        }

        /**
         * Attacher.
         */
        function attacher() {
            return transformer;
        }

        try {
            mdast.use(attacher).process('Foo');
        } catch (err) {
            assert(err === exception);
        }
    });
});

describe('function attacher(mdast, options)', function () {
    /*
     * Lot's of other tests are in
     * `mdast.use(plugin, options)`.
     */

    it('should be able to modify `Parser` without affecting other instances',
        function () {
            var doc = 'Hello w/ a @mention!\n';

            assert(
                mdast.use(mentions).process(doc) ===
                'Hello w/ a [@mention](https://github.com/blog/821)!\n'
            );

            assert(mdast.process(doc) === doc);
        }
    );
});

describe('function transformer(ast, file, next?)', function () {
    it('should be invoked when `run()` is invoked', function () {
        var result = mdast.parse('# Hello world');
        var isInvoked;

        /**
         * Plugin.
         */
        function assertion(ast, file) {
            assert(ast === result);
            assert(file instanceof File);

            isInvoked = true;
        }

        /**
         * Attacher.
         */
        function attacher() {
            return assertion;
        }

        mdast.use(attacher).run(result);

        assert(isInvoked === true);
    });

    it('should fail mdast if an exception occurs', function () {
        var exception = new Error('test');
        var fixture = '# Hello world';
        var ast = mdast.parse(fixture);

        /**
         * Thrower.
         */
        function thrower() {
            throw exception;
        }

        /**
         * Attacher.
         */
        function attacher() {
            return thrower;
        }

        assert.throws(function () {
            mdast.use(attacher).run(ast);
        }, /test/);
    });

    it('should fail mdast if an exception is returned', function () {
        var exception = new Error('test');
        var fixture = '# Hello world';
        var ast = mdast.parse(fixture);

        /**
         * Returner.
         */
        function thrower() {
            return exception;
        }

        /**
         * Attacher.
         */
        function attacher() {
            return thrower;
        }

        assert.throws(function () {
            mdast.use(attacher).run(ast);
        }, /test/);
    });

    it('should work on an example plugin', function () {
        var source = mdast.use(badges).process('# mdast');

        assert(
            source ===
            '# mdast [![Version](http://img.shields.io/npm/v/mdast.svg)' +
            '](https://www.npmjs.com/package/mdast)\n'
        );

        source = mdast.use(badges, {
            'flat': true
        }).process('# mdast');

        assert(
            source ===
            '# mdast [![Version](http://img.shields.io/npm/v/mdast.svg' +
            '?style=flat)](https://www.npmjs.com/package/mdast)\n'
        );
    });
});

describe('File(options?)', function () {
    it('should create a new `File`', function () {
        assert(new File() instanceof File);
    });

    it('should work without `new`', function () {
        /* eslint-disable new-cap */
        assert(File() instanceof File);
        /* eslint-enable new-cap */
    });

    it('should accept missing options', function () {
        var file = new File();

        assert(file.filename === null);
        assert(file.extension === 'md');
        assert(file.contents === '');
    });

    it('should accept a `string`', function () {
        var file = new File('Test');

        assert(file.filename === null);
        assert(file.extension === 'md');
        assert(file.contents === 'Test');
    });

    it('should accept an `Object`', function () {
        var file = new File({
            'filename': 'Untitled',
            'extension': 'markdown',
            'contents': 'Test'
        });

        assert(file.filename === 'Untitled');
        assert(file.extension === 'markdown');
        assert(file.contents === 'Test');
    });

    it('should accept a `File`', function () {
        var file = new File(new File({
            'filename': 'Untitled',
            'extension': 'markdown',
            'contents': 'Test'
        }));

        assert(file.filename === 'Untitled');
        assert(file.extension === 'markdown');
        assert(file.contents === 'Test');
    });

    describe('#filePath()', function () {
        it('should return `""` without a filename', function () {
            assert(new File().filePath() === '');
        });

        it('should return the filename without extension', function () {
            assert(new File({
                'filename': 'Untitled',
                'extension': null
            }).filePath() === 'Untitled');
        });

        it('should return the filename with extension', function () {
            assert(new File({
                'filename': 'Untitled',
                'extension': 'markdown'
            }).filePath() === 'Untitled.markdown');
        });

        it('should return the full file path', function () {
            assert(new File({
                'directory': 'foo/bar',
                'filename': 'baz',
                'extension': 'qux'
            }).filePath() === 'foo/bar/baz.qux');
        });

        it('should not return an extra directory slash', function () {
            assert(new File({
                'directory': '~/',
                'filename': 'baz',
                'extension': 'qux'
            }).filePath() === '~/baz.qux');
        });

        it('should not return the current directory', function () {
            assert(new File({
                'directory': '.',
                'filename': 'baz',
                'extension': 'qux'
            }).filePath() === 'baz.qux');

            assert(new File({
                'directory': './',
                'filename': 'baz',
                'extension': 'qux'
            }).filePath() === 'baz.qux');
        });

        it('should return the parent directory', function () {
            assert(new File({
                'directory': '..',
                'filename': 'baz',
                'extension': 'qux'
            }).filePath() === '../baz.qux');

            assert(new File({
                'directory': '../',
                'filename': 'baz',
                'extension': 'qux'
            }).filePath() === '../baz.qux');
        });
    });

    describe('#move()', function () {
        it('should change an extension', function () {
            var file = new File({
              'directory': '~',
              'filename': 'example',
              'extension': 'markdown'
            });

            file.move({
                'extension': 'md'
            });

            assert(file.filePath() === '~/example.md');
        });

        it('should change a filename', function () {
            var file = new File({
              'directory': '~',
              'filename': 'example',
              'extension': 'markdown'
            });

            file.move({
                'filename': 'foo'
            });

            assert(file.filePath() === '~/foo.markdown');
        });

        it('should change a directory', function () {
            var file = new File({
              'directory': '~',
              'filename': 'example',
              'extension': 'markdown'
            });

            file.move({
                'directory': '/var/www'
            });

            assert(file.filePath() === '/var/www/example.markdown');
        });

        it('should ignore not-given values', function () {
            var file = new File();

            file.extension = null;

            file.move();

            assert(file.filePath() === '');
        });

        it('should add a filename', function () {
            var file = new File();

            file.move({
                'filename': 'example'
            });

            assert(file.filePath() === 'example.md');
        });

        it('should add a directory', function () {
            var file = new File();

            file.move({
                'directory': '~',
                'filename': 'example'
            });

            assert(file.filePath() === '~/example.md');
        });

        it('should add an extension', function () {
            var file = new File({
                'filename': 'README',
                'extension': ''
            });

            file.move({
                'extension': 'md'
            });

            assert(file.filePath() === 'README.md');
        });
    });

    describe('#hasFailed()', function () {
        it('should return `false` when without messages', function () {
            var file = new File();

            assert(file.hasFailed() === false);

            file.warn('Foo');

            assert(file.hasFailed() === false);
        });

        it('should return `true` when with fatal messages', function () {
            var file = new File();

            file.quiet = true;

            file.fail('Foo');

            assert(file.hasFailed() === true);
        });
    });

    describe('#exception(reason, position?)', function () {
        it('should return an Error', function () {
            assert(new File().exception('') instanceof Error);
        });

        it('should add properties', function () {
            var err = new File({
                'filename': 'untitled'
            }).exception('test');

            assert(err.file === 'untitled.md');
            assert(err.reason === 'test');
            assert(err.line === null);
            assert(err.column === null);
        });

        it('should add properties on an unfilled file', function () {
            var err = new File().exception('test');

            assert(err.file === '');
            assert(err.reason === 'test');
            assert(err.line === null);
            assert(err.column === null);
        });

        it('should create a pretty message', function () {
            assert(new File().exception('test').message === 'test');
        });

        it('should have a pretty `toString()` message', function () {
            assert(new File().exception('test').toString() === '1:1: test');
        });

        it('should include the filename in `toString()`', function () {
            assert(new File({
                'filename': 'untitled'
            }).exception('test').toString() === 'untitled.md:1:1: test');
        });

        it('should accept an error', function () {
            var err = new Error('foo');
            var exception = new File().exception(err);

            assert(exception.stack === err.stack);
            assert(exception.message === err.message);
        });

        it('should accept a node', function () {
            var node = empty();

            node.position = {
                'start': {
                    'line': 2,
                    'column': 1
                },
                'end': {
                    'line': 2,
                    'column': 5
                }
            };

            assert(
                new File().exception('test', node).toString() ===
                '2:1-2:5: test'
            );
        });

        it('should accept a location', function () {
            var location = {
                'start': {
                    'line': 2,
                    'column': 1
                },
                'end': {
                    'line': 2,
                    'column': 5
                }
            };

            assert(
                new File().exception('test', location).toString() ===
                '2:1-2:5: test'
            );
        });

        it('should accept a position', function () {
            var position = {
                'line': 2,
                'column': 5
            };

            assert(
                new File().exception('test', position).toString() ===
                '2:5: test'
            );
        });
    });

    describe('#fail(reason, position?)', function () {
        it('should add a fatal error to `messages`', function () {
            var file = new File();
            var message;

            assert.throws(function () {
                file.fail('Foo', {
                    'line': 1,
                    'column': 3
                });
            }, /1:3: Foo/);

            assert(file.messages.length === 1);

            message = file.messages[0];

            assert(message.file === '');
            assert(message.reason === 'Foo');
            assert(message.line === 1);
            assert(message.column === 3);
            assert(message.name === '1:3');
            assert(message.fatal === true);
        });

        it('should not throw when `quiet: true`', function () {
            var file = new File();

            file.quiet = true;

            file.fail('Foo', {
                'line': 1,
                'column': 3
            });
        });
    });

    describe('#warn(reason, position?)', function () {
        it('should add a non-fatal error to `messages`', function () {
            var file = new File();
            var message;

            file.warn('Bar', {
                'line': 9,
                'column': 2
            });

            assert(file.messages.length === 1);

            message = file.messages[0];

            assert(message.file === '');
            assert(message.reason === 'Bar');
            assert(message.line === 9);
            assert(message.column === 2);
            assert(message.name === '9:2');
            assert(message.fatal === false);
        });
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

    assert('type' in context);

    if ('children' in context) {
        assert(Array.isArray(context.children));
        validateTokens(context.children);
    }

    /*
     * Validate position.
     */

    if ('position' in context) {
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
            Object.keys(context.footnotes).forEach(function (id) {
                validateToken(context.footnotes[id]);
            });
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
        assert(typeof context.loose === 'boolean');

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
        assert('children' in context);

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
        assert(typeof context.loose === 'boolean');
        assert(keys === 5);

        if (context.ordered) {
            assert(typeof context.start === 'number');
            assert(context.start === context.start);
        } else {
            assert(context.start === null);
        }

        return;
    }

    if (type === 'footnoteDefinition') {
        assert(keys === 3);
        assert('children' in context);
        assert(typeof context.identifier === 'string');

        return;
    }

    if (type === 'definition') {
        assert(typeof context.identifier === 'string');

        assert(
            context.title === null ||
            typeof context.title === 'string'
        );

        assert(typeof context.link === 'string');

        assert(keys === 4);

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

    if (type === 'linkReference') {
        assert('children' in context);
        assert(typeof context.identifier === 'string');

        assert(
            context.referenceType === 'shortcut' ||
            context.referenceType === 'collapsed' ||
            context.referenceType === 'full'
        );

        assert(keys === 4);

        return;
    }

    if (type === 'imageReference') {
        assert(typeof context.identifier === 'string');

        assert(
            context.alt === null ||
            typeof context.alt === 'string'
        );

        assert(
            context.referenceType === 'shortcut' ||
            context.referenceType === 'collapsed' ||
            context.referenceType === 'full'
        );

        assert(keys === 4);

        return;
    }

    if (type === 'footnoteReference') {
        assert(typeof context.identifier === 'string');
        assert(keys === 2);

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

        /*
         * Remove `position` when needed.
         */

        if (clean && key === 'position') {
            return;
        }

        /*
         * Ignore `checked` attributes se to `null`,
         * which only exist in `gfm` on list-items
         * without a checkbox.  This ensures less
         * needed fixtures.
         */

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
function compare(node, baseline, clean, cleanBaseline) {
    validateToken(node);

    if (clean && !cleanBaseline) {
        cleanBaseline = true;
    }

    try {
        assert.deepEqual(clone(node, clean), clone(baseline, cleanBaseline));
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
                var node;
                var markdown;
                var initialClean = !parse.position;

                it('should parse `' + name + '` correctly', function () {
                    node = mdast.parse(input, parse);

                    /*
                     * The first assertion should not clean positional
                     * information, except when `position: false`: in that
                     * case the baseline should be stripped of positional
                     * information.
                     */

                    compare(node, trees[mapping[key]], false, initialClean);
                });

                if (output !== false) {
                    it('should stringify `' + name + '`', function () {
                        markdown = mdast.stringify(node, fixture.stringify);
                        compare(node, mdast.parse(markdown, parse), true);
                    });
                }

                if (output === true) {
                    it('should stringify `' + name + '` exact', function () {
                        markdown = mdast.stringify(node, fixture.stringify);
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
