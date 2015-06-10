/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module Engine
 * @fileoverview CLI Engine.
 */

'use strict';

/*
 * Dependencies.
 */

var path = require('path');
var fs = require('fs');
var debug = require('debug')('mdast');
var chalk = require('chalk');
var concat = require('concat-stream');
var mdast = require('../..');
var Configuration = require('./configuration');
var program = require('./program');
var format = require('./formatter');
var Traverser = require('./traverse');
var Ignore = require('./ignore');
var File = require('../file');

/*
 * Methods.
 */

var exists = fs.existsSync || path.existsSync;
var resolve = path.resolve;
var join = path.join;
var read = fs.readFile;
var write = fs.writeFile;
var basename = path.basename;
var extname = path.extname;
var dirname = path.dirname;
var stdout = process.stdout;
var stdin = process.stdin;
var stderr = process.stderr;

/*
 * Constants.
 */

var ENCODING = 'utf-8';
var EXTENSIONS = ['md', 'markdown', 'mkd', 'mkdn', 'mkdown', 'ron'];

var cwd = process.cwd();
var expextPipeIn = !stdin.isTTY;
var seperator = path.sep;

/**
 * Find root of a node module: parent directory of
 * `package.json`, or, the given directory if no
 * ancestral `package.json` is found.
 *
 * @example
 *   findRoot('mdast/test'); // 'mdast'
 *
 * @param {string} base - Path to directory.
 * @return {string} - Path to an ancestral project
 *   directory.
 */
function findRoot(base) {
    var location = base;
    var parts = base.split(seperator);

    while (!exists(join(location, 'package.json')) && parts.length > 1) {
        parts.pop();

        location = parts.join(seperator);
    }

    return parts.length ? location : base;
}

/*
 * Root.
 */

var root = findRoot(cwd);

debug('Using root: `%s`', root);

/**
 * Require a plugin.  Checks, in this order:
 *
 * -  `$package/$pathlike`;
 * -  `$package/$pathlike.js`;
 * -  `$package/node_modules/$pathlike`;
 * -  `$package/node_modules/mdast-$pathlike`;
 * -  `$cwd/node_modules/$pathlike`;
 * -  `$cwd/node_modules/mdast-$pathlike`;
 * -  `$plugin`.
 *
 * Where `$package` is an ancestral package directory and
 * `$cwd` is the current working directory.
 *
 * @example
 *   var plugin = findPlugin('toc');
 *
 * @throws {Error} - Fails when `pathlike` cannot be
 *   resolved.
 * @param {string} pathlike - Reference to plugin.
 * @return {Object} - Result of `require`ing `plugin`.
 */
function findPlugin(pathlike) {
    var local = resolve(root, pathlike);
    var npm = resolve(root, 'node_modules', pathlike);
    var npmPrefixed = resolve(root, 'node_modules', 'mdast-' + pathlike);
    var current = resolve(cwd, 'node_modules', pathlike);
    var currentPrefixed = resolve(cwd, 'node_modules', 'mdast-' + pathlike);
    var plugin;

    if (exists(local) || exists(local + '.js')) {
        plugin = local;
    } else if (exists(npm)) {
        plugin = npm;
    } else if (exists(npmPrefixed)) {
        plugin = npmPrefixed;
    } else if (exists(current)) {
        plugin = current;
    } else if (exists(currentPrefixed)) {
        plugin = currentPrefixed;
    } else {
        plugin = pathlike;
    }

    debug('Using plug-in `%s` at `%s`', pathlike, plugin);

    return require(plugin);
}

/**
 * Process a file. This is the interface between mdast(1)
 * and mdast(3).
 *
 * @example
 *   var file = new File('Foo bar baz');
 *   var configurtion = new Configuration();
 *   run(file, configurtion, true, console.log);
 *
 * @param {File} file - Input file.
 * @param {Configuration} configuration - Configuration to
 *   use.
 * @param {boolean} stringify - Whether to stringify, or
 *   to expose the tree.
 * @param {function(Error?, string?, File?)} done
 */
function run(file, configuration, stringify, done) {
    var processor = mdast();
    var options = configuration.getConfiguration(file.filePath());
    var plugins;
    var ast;

    debug('Using settings `%j`', options.settings);

    plugins = Object.keys(options.plugins);

    debug('Using plug-ins `%j`', plugins);

    /*
     * Use, with options.
     */

    plugins.forEach(function (name) {
        var option = options.plugins[name];
        var plugin = findPlugin(name);

        debug('Applying options `%j` to `%s`', option, name);

        processor = processor.use(plugin, option);
    });

    debug('Parsing document');

    if (stringify) {
        processor.process(file, options.settings, done);
    } else {
        ast = processor.parse(file, options.settings);

        processor.run(ast, file, function (exception) {
            if (exception) {
                done(exception);
            } else {
                done(null, JSON.stringify(ast, null, 2), file);
            }
        });
    }
}

/**
 * Bound `console.log`.
 */
function consoleLog() {
    console.log.apply(console, arguments);
}

/**
 * No-operation.
 */
function noop() {}

/**
 * CLI engine. This is used by `bin/mdast`.
 *
 * @example
 *   engine('--use toc . --output --quiet', console.log);
 *
 * @throws {Error} - When both stdin and files are used.
 * @throws {Error} - When multiple files and a single
 *   output location is given.
 * @param {Array.<*>} argv - CLI arguments.
 * @param {function(Error?)} fail - Callback invoked when
 *   a fatal error occured. Note that uncaught errors do
 *   also occur: those should be treated as being passed
 *   to this function.
 */
function engine(argv, fail) {
    var cli = program.parse(argv);
    var extensions = [].concat(cli.ext, EXTENSIONS);
    var log = cli.silent || cli.quiet ? noop : consoleLog;
    var files = cli.args;
    var multiFileMode;
    var traverser;
    var ignore;

    chalk.enabled = program.color;

    var configuration = new Configuration({
        'useRC': cli.rc,
        'file': cli.configPath,
        'settings': cli.setting,
        'plugins': cli.use
    });

    if (!expextPipeIn && !files.length) {
        if (cli.output && cli.output !== true) {
            debug('Using output `%s` as input', cli.output);

            files.push(cli.output);
        } else {
            cli.outputHelp();

            fail();

            return;
        }
    }

    ignore = new Ignore({
        'file': cli.ignorePath,
        'useIgnore': cli.ignore
    });

    traverser = new Traverser(extensions, ignore.getPatterns());

    files = traverser.traverse(files);

    multiFileMode = files.length > 1;

    if (files.length && expextPipeIn) {
        throw new Error('mdast does not accept both files and stdin');
    }

    if (multiFileMode && cli.output !== undefined && cli.output !== true) {
        throw new Error(
            'mdast cannot write multiple files to a single output.\n' +
            'Did you mean to pass `--output` without value?'
        );
    }

    if (cli.filePath && files.length) {
        throw new Error(
            'mdast does not accept `--file-path` for real files.\n' +
            'Did you mean to pass STDIN?'
        );
    }

    /**
     * Log `file` warnings and errors, or a success
     * message.
     *
     * @example
     *   var file = new File();
     *   file.warn('Something went wrong!');
     *   done(file);
     *
     * @param {File} file - File to report.
     * @param {boolean?} [didWrite] - Whether `file`
     *   was written to stdout or to thefile system,
     *   or not.
     */
    function done(file, didWrite) {
        var hasFailed = file.hasFailed();
        var result;

        /*
         * Remove non-fatal messages in silent mode.
         */

        if (program.silent) {
            file.messages = file.messages.filter(function (message) {
                return message.fatal === true;
            });
        }

        if (!file.filename) {
            file.filename = '<stdin>';
            file.extension = '';
        }

        result = format([file]);

        /*
         * Ensure we exit with `1` if a `fatal` error.
         * exists in `file`.
         */

        if (result) {
            stderr.write(result + '\n');

            if (hasFailed) {
                fail();
            }
        } else {
            log(
                chalk.underline(file.filePath()) + ': ' +
                (didWrite ? chalk.green('written') : chalk.yellow('done')) +
                '.'
            );
        }
    }

    /**
     * Output result after processing.
     *
     * @example
     *   output(new Error('Foo'));
     *   output(null, 'foo', new File());
     *
     * @param {Error?} exception - Error which occurred
     *   during processing.
     * @param {string?} [doc] - Processed document.
     * @param {File?} [file] - Processed file.
     */
    function output(exception, doc, file) {
        var outpath = cli.output;

        if (exception) {
            fail(exception);

            return;
        }

        /*
         * `stdout`.
         */

        if (!multiFileMode && !outpath) {
            debug('Writing document to standard out');

            done(file);

            stdout.write(doc);
        } else {
            if (!outpath) {
                done(file);
                return;
            }

            if (multiFileMode || outpath === true) {
                outpath = file.filePath();
            }

            debug('Writing document to `%s`', outpath);

            write(outpath, doc, function (err) {
                if (err) {
                    file.fail(err);
                }

                done(file, true);
            });
        }
    }

    /**
     * Factory for `check`. Used as a callback to results
     * from `stdin` and file system.
     *
     * @example
     *   var check = checkFactory(new File('Foo'), false);
     *   check('Bar');
     *
     * @param {File} file
     * @param {boolean?} [canFail] - `false` if the first
     *   parameter passed `check` is not an error, but
     *   the actual value.
     * @return {function(Error?, string?)}
     */
    function checkFactory(file, canFail) {
        /**
         * Safely process a document.
         *
         * @param {Error?} exception
         * @param {string?} [doc]
         */
        function check(exception, doc) {
            if (canFail === false) {
                doc = exception;
                exception = null;
            }

            file.contents = doc || '';

            if (exception) {
                file.fail(exception);

                done(file);

                return;
            }

            try {
                run(file, configuration, !cli.ast, output);
            } catch (failure) {
                file.fail(failure);

                done(file);
            }
        }

        return check;
    }

    if (files.length) {
        files.forEach(function (file) {
            if (!file.isFile || file.hasFailed()) {
                done(file);
            } else {
                debug('Reading `%s` in `%s`', file.filePath(), ENCODING);

                read(file.filePath(), ENCODING, checkFactory(file));
            }
        });
    } else {
        debug('Reading from stdin');

        process.stdin.pipe(concat({
            'encoding': 'string'
        }, function (value) {
            var extension = cli.filePath && extname(cli.filePath);
            var file = new File(cli.filePath ? {
                'directory': dirname(cli.filePath),
                'filename': basename(cli.filePath, extension),
                'extension': extension.slice(1)
            } : {});

            file.quiet = true;
            file.exists = true;
            file.isFile = true;

            checkFactory(file, false)(value);
        }));
    }
}

/*
 * Expose.
 */

module.exports = engine;
