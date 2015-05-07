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
 * Shortcuts.
 */

var exists = fs.existsSync || path.existsSync;
var resolve = path.resolve;
var join = path.join;
var read = fs.readFile;
var write = fs.writeFile;
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
 * Find root of node modules.
 *
 * @param {string} base - Path to search from.
 * @return {string}
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
 * Find a plugin.
 *
 * @param {string} pathlike
 * @return {Object}
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
 * Process `value`.
 *
 * @param {File} file
 * @param {Configuration} configuration
 * @param {boolean} stringify
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

    plugins.forEach(function (plugin) {
        var option = options.plugins[plugin];

        processor = processor.use(findPlugin(plugin), option);
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
 * CLI engine.
 *
 * @param {Array.<*>} argv
 * @param {function(Error?)} fail
 */
function engine(argv, fail) {
    var cli = program.parse(argv);
    var extensions = [].concat(cli.ext, EXTENSIONS);
    var log = cli.quiet ? noop : consoleLog;
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

    if (multiFileMode) {
        if (cli.output !== undefined && cli.output !== true) {
            throw new Error(
                'mdast cannot write multiple files to a single output.\n' +
                'Did you mean to pass `--output` without value?'
            );
        }
    }

    /**
     * Format `file`.
     *
     * @param {File} file
     * @param {boolean?} [didWrite]
     */
    function done(file, didWrite) {
        var result = format([file]);

        /*
         * Ensure we exit with `1`.
         */

        if (result) {
            if (file.hasFailed()) {
                stderr.write(result + '\n');
                fail();
            } else {
                console.log(result);
            }
        } else {
            log(
                chalk.gray(file.filePath()) + ': ' +
                (didWrite ? chalk.green('written') : chalk.yellow('done')) +
                '.'
            );
        }
    }

    /**
     * Output result.
     *
     * @param {Error?} exception
     * @param {string?} doc
     */
    function output(exception, doc, file) {
        var outpath = cli.output;

        if (exception) {
            fail(exception);

            return;
        }

        /*
         * STDOUT.
         */

        if (!multiFileMode && !outpath) {
            debug('Writing document to standard out');

            if (file.hasFailed()) {
                done(file);
            } else {
                stdout.write(doc);
            }
        } else {
            if (!outpath) {
                done(file);
                return;
            }

            /*
             * Log message when multiple files were given.
             */

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
     * Factory for `check`.
     *
     * @param {File} file
     * @param {boolean?} canFail - `false` if the first
     *   parameter passed `check` is not an error, but
     *   the actual value.
     * @return {function(Error?, string?)}
     */
    function checkFactory(file, canFail) {
        /**
         * Safely process a document.
         *
         * @param {Error?} exception
         * @param {string?} doc
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
            var file = new File({
                'filename': ''
            });

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
