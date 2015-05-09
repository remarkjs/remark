/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module Defaults
 * @fileoverview Default values for parse and
 *  stringification settings.
 */

'use strict';

module.exports = {
    'parse': {
        'gfm': true,
        'yaml': true,
        'commonmark': false,
        'footnotes': false,
        'pedantic': false,
        'breaks': false
    },
    'stringify': {
        'setext': false,
        'closeAtx': false,
        'looseTable': false,
        'spacedTable': true,
        'incrementListMarker': true,
        'fences': false,
        'fence': '`',
        'bullet': '-',
        'rule': '*',
        'ruleSpaces': true,
        'ruleRepetition': 3,
        'strong': '*',
        'emphasis': '_'
    }
};
