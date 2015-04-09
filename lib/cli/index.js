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
var File = require('../file');

/*
 * Shortcuts.
 */

var exists = fs.existsSync || path.existsSync;
var resolve = path.resolve;
var join = path.join;
var extname = path.extname;
var basename = path.basename;
var dirname = path.dirname;
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
 * @param {string} value
 * @param {Configuration} configuration
 * @param {boolean} stringify
 * @param {string?} filepath
 * @param {function(Error?, string?, File?)} done
 */
function run(value, configuration, stringify, filepath, done) {
    var processor = mdast();
    var options = configuration.getConfiguration(filepath);
    var extension = extname(filepath);
    var plugins;
    var file;
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

    extension = extname(filepath);

    file = new File({
        'directory': dirname(filepath),
        'filename': basename(filepath, extension),
        'extension': extension.slice(1),
        'contents': value
    });

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

        if (!outpath) {
            debug('Writing document to standard out');

            stdout.write(doc);
        } else {
            /*
             * Log message when multiple files were given.
             */

            if (multiFileMode || outpath === true) {
                outpath = join(file.directory, file.getFile());
            }

            debug('Writing document to `%s`', outpath);

            write(outpath, doc, function (err) {
                if (err) {
                    fail(err);
                } else if (multiFileMode) {
                    log(chalk.yellow('  Generated `' + outpath + '`'));
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
        function check(exception, doc) {
            if (canFail === false) {
                doc = exception;
                exception = null;
            }

            if (exception) {
                fail(exception);

                return;
            }

            try {
                doc = run(doc, configuration, !cli.ast, filepath, output);
            } catch (failure) {
                fail(failure);

                return;
            }
        }

        return check;
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
