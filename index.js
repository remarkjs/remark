'use strict';

/*
 * Dependencies..
 */

var Ware = require('ware');

/*
 * Components.
 */

var parse = require('./lib/parse.js');
var stringify = require('./lib/stringify.js');
var clone = require('./lib/utilities.js').clone;

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

    this.Parser = constructParser();
    this.Compiler = constructCompiler();
}

/**
 * Apply plugins to `node`.
 *
 * @param {Node} node
 * @param {Object?} options
 * @return {Node} - `node`.
 */
function run(node, options) {
    var self = this;

    /*
     * Only run when this is an instance of MDAST.
     */

    if (self.ware) {
        self.ware.run(node, options || {}, self, fail);
    }

    return node;
}

/**
 * Construct an MDAST instance and use a plugin.
 *
 * @param {Function} plugin
 * @return {MDAST}
 */
function use(plugin) {
    var self = this;

    if (!(self instanceof MDAST)) {
        self = new MDAST();
    }

    self.ware.use(plugin);

    if (plugin && 'attach' in plugin) {
        plugin.attach(self);
    }

    return self;
}

/**
 * Parse a value and apply plugins.
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
