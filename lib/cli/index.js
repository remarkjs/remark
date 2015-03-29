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
var Traverser = require('./traverse');
var Ignore = require('./ignore');

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
    var current = resolve(cwd, 'node_modules', pathlike);
    var plugin;

    if (exists(local) || exists(local + '.js')) {
        plugin = local;
    } else if (exists(npm)) {
        plugin = npm;
    } else if (exists(current)) {
        plugin = current;
    } else {
        plugin = pathlike;
    }

    debug('Using plugin `%s` at `%s`', pathlike, plugin);

    return require(plugin);
}

/**
 * Process `value`.
 *
 * @param {string} value
 * @param {Configuration} configuration
 * @param {boolean} stringify
 * @param {string?} filepath
 */
function run(value, configuration, stringify, filepath) {
    var parser = mdast;
    var options = configuration.getConfiguration(filepath);
    var plugins;
    var doc;

    debug('Using settings `%j`', options.settings);

    plugins = options.plugins.map(findPlugin);

    debug('Using plug-ins `%j`', options.plugins);

    parser = parser.use(plugins);

    debug('Parsing document');

    doc = parser.parse(value, options.settings);

    if (stringify) {
        doc = parser.stringify(doc, options.settings);
    } else {
        doc = JSON.stringify(doc, null, 2);
    }

    return doc;
}

/**
 * Bound `console.log`.
 */
function consoleLog() {
    console.log.apply(console, arguments);
}

/**
 * Noop
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
    var configuration;
    var traverser;
    var ignore;

    chalk.enabled = program.color;

    try {
        configuration = new Configuration({
            'useRC': cli.rc,
            'file': cli.configPath,
            'settings': cli.setting,
            'plugins': cli.use
        });
    } catch (failure) {
        fail(failure);

        return;
    }

    if (!expextPipeIn && !files.length) {
        if (cli.output) {
            debug('Using output `%s` as input', cli.output);

            files.push(cli.output);
        } else {
            cli.outputHelp();

            fail();

            return;
        }
    }

    try {
        ignore = new Ignore({
            'file': cli.ignorePath,
            'useIgnore': cli.ignore
        });

        traverser = new Traverser(extensions, ignore.getPatterns());

        files = traverser.traverse(files);
    } catch (failure) {
        fail(failure);

        return;
    }

    multiFileMode = files.length > 1;

    if (files.length) {
        if (expextPipeIn) {
            fail(new Error(
                'mdast does not accept both files and stdin'
            ));

            return;
        }
    }

    if (multiFileMode) {
        if (cli.output === undefined) {
            fail(new Error(
                'mdast cannot write multiple files to stdout.\n' +
                'Did you mean to pass `--output`?'
            ));

            return;
        }

        if (cli.output !== true) {
            fail(new Error(
                'mdast cannot write multiple files to a single output.\n' +
                'Did you mean to pass `--output` (without value)?'
            ));

            return;
        }
    }

    /**
     * Output result.
     *
     * @param {string} doc
     */
    function output(doc, filepath) {
        var outpath = cli.output;

        /*
         * STDOUT.
         */

        if (!outpath) {
            debug('Writing document to standard out');

            stdout.write(doc);
        } else {
            /*
             * Log message when multiple files were given.
             */

            if (multiFileMode || outpath === true) {
                outpath = filepath;
            }

            debug('Writing document to `%s`', outpath);

            write(outpath, doc, function (exception) {
                if (exception) {
                    fail(exception);
                }

                if (multiFileMode) {
                    log(chalk.yellow('  Rewrote `' + filepath + '`'));
                }
            });
        }
    }

    /**
     * Factory for `check`.
     *
     * @param {string} filepath
     * @param {boolean?} canFail - `false` if the first
     *   parameter passed `check` is not an error, but
     *   the actual value.
     * @return {function(Error?, string?)}
     */
    function checkFactory(filepath, canFail) {
        /**
         * Safely process a document.
         *
         * @param {Error?} exception
         * @param {string?} doc
         */
        return function (exception, doc) {
            if (canFail === false) {
                doc = exception;
                exception = null;
            }

            if (exception) {
                fail(exception);

                return;
            }

            try {
                doc = run(doc, configuration, !cli.ast, files[0]);
            } catch (failure) {
                fail(failure);

                return;
            }

            output(doc, filepath);
        };
    }

    if (files.length) {
        if (multiFileMode) {
            log(chalk.bold('Processing...'));
            log();
        }

        files.forEach(function (file) {
            debug('Reading from `%s` using encoding `%s`', file, ENCODING);

            read(file, ENCODING, checkFactory(file));
        });
    } else {
        debug('Reading from stdin using encoding `%s`', ENCODING);

        process.stdin.pipe(concat({
            'encoding': 'string'
        }, function (value) {
            checkFactory(null, false)(value);
        }));
    }
}

/*
 * Expose.
 */

module.exports = engine;
