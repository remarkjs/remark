'use strict';

/*
 * Dependencies.
 */

var Ware = require('ware');
var parse = require('./lib/parse.js');
var stringify = require('./lib/stringify.js');
var utilities = require('./lib/utilities.js');

/*
 * Methods.
 */

var clone = utilities.clone;
var Parser = parse.Parser;
var parseProto = Parser.prototype;
var Compiler = stringify.Compiler;
var compileProto = Compiler.prototype;

/**
 * Throws if passed an exception.
 *
 * Here until the following PR is merged into
 * segmentio/ware:
 *
 *   https://github.com/segmentio/ware/pull/21
 *
 * @param {Error?} exception
 */
function fail(exception) {
    if (exception) {
        throw exception;
    }
}

/**
 * Create a `parse` function which uses an
 * extensible `Parser`.
 *
 * @return {Function}
 */
function constructParser() {
    var customProto;
    var expressions;
    var key;

    /**
     * Extensible prototype.
     */
    function CustomProto() {}

    CustomProto.prototype = parseProto;

    customProto = new CustomProto();

    /**
     * Extensible constructor.
     */
    function CustomParser() {
        Parser.apply(this, arguments);
    }

    CustomParser.prototype = customProto;

    /*
     * Construct new objects for things that plugin's
     * might modify.
     */

    customProto.blockTokenizers = clone(parseProto.blockTokenizers);
    customProto.blockMethods = clone(parseProto.blockMethods);
    customProto.inlineTokenizers = clone(parseProto.inlineTokenizers);
    customProto.inlineMethods = clone(parseProto.inlineMethods);

    expressions = parseProto.expressions;
    customProto.expressions = {};

    for (key in expressions) {
        customProto.expressions[key] = clone(expressions[key]);
    }

    return CustomParser;
}

/**
 * Create a `stringify` function which uses an
 * extensible `Compiler`.
 *
 * @return {Function}
 */
function constructCompiler() {
    var customProto;

    /**
     * Extensible prototype.
     */
    function CustomProto() {}

    CustomProto.prototype = compileProto;

    customProto = new CustomProto();

    /**
     * Extensible constructor.
     */
    function CustomCompiler() {
        Compiler.apply(this, arguments);
    }

    CustomCompiler.prototype = customProto;

    return CustomCompiler;
}

/**
 * Construct an MDAST instance.
 *
 * @constructor {MDAST}
 */
function MDAST() {
    this.ware = new Ware();
    this.attachers = [];

    this.Parser = constructParser();
    this.Compiler = constructCompiler();
}

/**
 * Apply transformers to `node`.
 *
 * @param {Node} ast
 * @param {Object?} options
 * @return {Node} - `ast`.
 */
function run(ast, options) {
    var self = this;

    if (typeof ast !== 'object' && typeof ast.type !== 'string') {
        utilities.raise(ast, 'ast');
    }

    /*
     * Only run when this is an instance of MDAST.
     */

    if (self.ware) {
        self.ware.run(ast, options || {}, self, fail);
    }

    return ast;
}

/**
 * Attach a plugin.
 *
 * @param {Function|Array.<Function>} attach
 * @return {MDAST}
 */
function use(attach, options) {
    var self = this;
    var index;
    var transformer;

    if (!(self instanceof MDAST)) {
        self = new MDAST();
    }

    /*
     * Multiple attachers.
     */

    if ('length' in attach && typeof attach !== 'function') {
        index = attach.length;

        while (attach[--index]) {
            self.use(attach[index]);
        }

        return self;
    }

    /*
     * Single plugin.
     */

    if (self.attachers.indexOf(attach) === -1) {
        transformer = attach(self, options);

        self.attachers.push(attach);

        if (transformer) {
            self.ware.use(transformer);
        }
    }

    return self;
}

/**
 * Parse a value and apply transformers.
 *
 * @return {Root}
 */
function runParse(_, options) {
    return this.run(parse.apply(this, arguments), options);
}

/*
 * Prototype.
 */

MDAST.prototype.parse = runParse;
MDAST.prototype.stringify = stringify;
MDAST.prototype.use = use;
MDAST.prototype.run = run;

/*
 * Expose `mdast`.
 */

module.exports = {
    'parse': parse,
    'stringify': stringify,
    'use': use,
    'run': run
};
