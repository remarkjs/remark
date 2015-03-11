'use strict';

var parse = {
    'gfm': true,
    'yaml': true,
    'commonmark': false,
    'footnotes': false,
    'pedantic': false,
    'breaks': false
};

var stringify = {
    'setext': false,
    'closeAtx': false,
    'looseTable': false,
    'spacedTable': true,
    'referenceLinks': false,
    'fences': false,
    'fence': '`',
    'bullet': '-',
    'rule': '*',
    'ruleSpaces': true,
    'ruleRepetition': 3,
    'strong': '*',
    'emphasis': '_'
};

exports.parse = parse;
exports.stringify = stringify;
