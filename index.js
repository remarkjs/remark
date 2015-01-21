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
    this.ware = new Ware();
}

/**
 * Parse a value and apply plugins.
 *
 * @return {Root}
 */
function runParse(_, options) {
    var node;

    node = parse.apply(parse, arguments);

    this.ware.run(node, options);

    return node;
}

/**
 * Construct an MDAST instance and use a plugin.
 *
 * @return {MDAST}
 */
function use(plugin) {
    var self;

    self = this;

    if (!(self instanceof MDAST)) {
        self = new MDAST();
    }

    self.ware.use(plugin);

    return self;
}

/*
 * Prototype.
 */

MDAST.prototype.parse = runParse;
MDAST.prototype.stringify = stringify;
MDAST.prototype.use = use;

/*
 * Expose `mdast`.
 */

module.exports = {
    'parse': parse,
    'stringify': stringify,
    'use': use
};
