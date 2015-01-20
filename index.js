'use strict';

/*
 * Dependencies..
 */

var Ware;

Ware = require('ware');

/*
 * Components.
 */

var parse,
    stringify;

parse = require('./lib/parse.js');
stringify = require('./lib/stringify.js');

/**
 * Construct an MDAST instance.
 *
 * @constructor {MDAST}
 */
function MDAST() {
    this.compiler = new Ware();
    this.parser = new Ware();
}

/**
 * Parse a value and apply plugins.
 *
 * @return {Root}
 */
function runParse(_, options) {
    var node;

    node = parse.apply(this, arguments);

    return self.parser.run.apply(node, options);
}

/**
 * Stringify a value and apply plugins.
 *
 * @return {Root}
 */
function runStringify(_, options) {
    var value;

    value = stringify.apply(this, arguments);

    return self.compiler.run(value, options);
}

/**
 * Construct an MDAST instance and use a plugin.
 *
 * @return {MDAST}
 */
function use(plugin) {
    var self,
        parser,
        compiler;

    self = this;

    if (!(self instanceof MDAST)) {
        self = new MDAST();
    }

    if (typeof plugin !== 'function') {
        parser = plugin;
        compiler = plugin;
    } else {
        parser = plugin.parse;
        compiler = plugin.stringify;
    }

    self.compiler.use(compiler);
    self.parser.use(parser);

    return self;
}

/*
 * Prototype.
 */

MDAST.prototype.parse = runParse;
MDAST.prototype.stringify = runStringify;
MDAST.prototype.use = use;

/*
 * Expose `mdast`.
 */

module.exports = {
    'parse': parse,
    'stringify': stringify,
    'use': use
};
