'use strict';

/*
 * Dependencies.
 */

var table = require('markdown-table');
var utilities = require('./utilities.js');
var defaults = require('./defaults.js').stringify;

/*
 * Cached methods.
 */

var repeat = utilities.repeat;
var copy = utilities.copy;
var raise = utilities.raise;
var trimLeft = utilities.trimLeft;
var validate = utilities.validate;
var count = utilities.countCharacter;

/*
 * Constants.
 */

var HALF = 2;
var INDENT = 4;
var MINIMUM_CODE_FENCE_LENGTH = 3;
var MINIMUM_RULE_LENGTH = 3;

var EXPRESSIONS_WHITE_SPACE = /\s/;

/*
 * Characters.
 */

var ANGLE_BRACKET_CLOSE = '>';
var ANGLE_BRACKET_OPEN = '<';
var ASTERISK = '*';
var CARET = '^';
var COLON = ':';
var DASH = '-';
var DOT = '.';
var EMPTY = '';
var EQUALS = '=';
var EXCLAMATION_MARK = '!';
var HASH = '#';
var LINE = '\n';
var PARENTHESIS_OPEN = '(';
var PARENTHESIS_CLOSE = ')';
var PIPE = '|';
var PLUS = '+';
var QUOTE_DOUBLE = '"';
var QUOTE_SINGLE = '\'';
var SPACE = ' ';
var SQUARE_BRACKET_OPEN = '[';
var SQUARE_BRACKET_CLOSE = ']';
var TICK = '`';
var TILDE = '~';
var UNDERSCORE = '_';

/*
 * Character combinations.
 */

var BREAK = LINE + LINE;
var GAP = BREAK + LINE;
var DOUBLE_TILDE = TILDE + TILDE;

/*
 * Define allowed list-bullet characters.
 */

var LIST_BULLETS = {};

LIST_BULLETS[ASTERISK] = true;
LIST_BULLETS[DASH] = true;
LIST_BULLETS[PLUS] = true;

/*
 * Define allowed horizontal-rule bullet characters.
 */

var HORIZONTAL_RULE_BULLETS = {};

HORIZONTAL_RULE_BULLETS[ASTERISK] = true;
HORIZONTAL_RULE_BULLETS[DASH] = true;
HORIZONTAL_RULE_BULLETS[UNDERSCORE] = true;

/*
 * Define allowed emphasis characters.
 */

var EMPHASIS_MARKERS = {};

EMPHASIS_MARKERS[UNDERSCORE] = true;
EMPHASIS_MARKERS[ASTERISK] = true;

/*
 * Define allowed emphasis characters.
 */

var FENCE_MARKERS = {};

FENCE_MARKERS[TICK] = true;
FENCE_MARKERS[TILDE] = true;

/*
 * Define which method to use based on `list.ordered`.
 */

var ORDERED_MAP = {};

ORDERED_MAP.true = 'visitOrderedItems';
ORDERED_MAP.false = 'visitUnorderedItems';

/**
 * Checks if `url` needs to be enclosed by angle brackets.
 *
 * @param {string} uri
 * @return {boolean}
 */
function needsAngleBraceEnclosure(uri) {
    return !uri.length ||
        EXPRESSIONS_WHITE_SPACE.test(uri) ||
        count(uri, PARENTHESIS_OPEN) !== count(uri, PARENTHESIS_CLOSE);
}

/**
 * There is currently no way to support nested delimiters
 * across Markdown.pl, CommonMark, and GitHub (RedCarpet).
 * The following supports Markdown.pl, and GitHub.
 * CommonMark is not supported when mixing double- and
 * single quotes inside a title.
 *
 * @see https://github.com/vmg/redcarpet/issues/473
 * @see https://github.com/jgm/CommonMark/issues/308
 *
 * @param {string} title
 * @return {string}
 */
function encloseTitle(title) {
    var delimiter = QUOTE_DOUBLE;

    if (title.indexOf(QUOTE_DOUBLE) !== -1) {
        delimiter = QUOTE_SINGLE;
    }

    return delimiter + title + delimiter;
}

/**
 * Helper to get the keys in an object.
 *
 * @param {Object} object
 * @return {Array.<string>}
 */
function getKeys(object) {
    var results = [];
    var key;

    for (key in object) {
        results.push(key);
    }

    return results;
}

/**
 * Get the count of the longest repeating streak
 * of `character` in `value`.
 *
 * @param {string} value
 * @param {string} character
 * @return {number}
 */
function getLongestRepetition(value, character) {
    var highestCount = 0;
    var index = -1;
    var length = value.length;
    var currentCount = 0;
    var currentCharacter;

    while (++index < length) {
        currentCharacter = value.charAt(index);

        if (currentCharacter === character) {
            currentCount++;

            if (currentCount > highestCount) {
                highestCount = currentCount;
            }
        } else {
            currentCount = 0;
        }
    }

    return highestCount;
}

/**
 * Pad `value` with `level * INDENT` spaces.
 *
 * @param {string} value
 * @param {number} level
 * @return {string}
 */
function pad(value, level) {
    var index;
    var padding;

    value = value.split(LINE);

    index = value.length;
    padding = repeat(level * INDENT, SPACE);

    while (index--) {
        if (value[index].length !== 0) {
            value[index] = padding + value[index];
        }
    }

    return value.join(LINE);
}

/**
 * Construct a new compiler.
 *
 * @param {Object?} options
 * @constructor Compiler
 */
function Compiler(options) {
    var self = this;
    var ruleRepetition;

    self.footnoteCounter = 0;
    self.linkCounter = 0;
    self.links = [];

    if (options === null || options === undefined) {
        options = {};
    } else if (typeof options !== 'object') {
        raise(options, 'options');
    } else {
        options = copy({}, options);
    }

    validate.map(options, 'bullet', LIST_BULLETS, defaults.bullet);
    validate.map(options, 'rule', HORIZONTAL_RULE_BULLETS, defaults.rule);
    validate.map(options, 'emphasis', EMPHASIS_MARKERS, defaults.emphasis);
    validate.map(options, 'strong', EMPHASIS_MARKERS, defaults.strong);
    validate.map(options, 'fence', FENCE_MARKERS, defaults.fence);
    validate.bool(options, 'ruleSpaces', defaults.ruleSpaces);
    validate.bool(options, 'setext', defaults.setext);
    validate.bool(options, 'closeAtx', defaults.closeAtx);
    validate.bool(options, 'looseTable', defaults.looseTable);
    validate.bool(options, 'spacedTable', defaults.spacedTable);
    validate.bool(options, 'referenceLinks', defaults.referenceLinks);
    validate.bool(options, 'fences', defaults.fences);
    validate.num(options, 'ruleRepetition', defaults.ruleRepetition);

    ruleRepetition = options.ruleRepetition;

    if (
        ruleRepetition < MINIMUM_RULE_LENGTH ||
        ruleRepetition !== ruleRepetition
    ) {
        raise(ruleRepetition, 'options.ruleRepetition');
    }

    self.options = options;
}

/*
 * Cache prototype.
 */

var compilerPrototype = Compiler.prototype;

/**
 * Visit a token.
 *
 * @param {Object} token
 * @param {Object} parent
 * @param {number} level
 * @return {string}
 */
compilerPrototype.visit = function (token, parent, level) {
    if (!level) {
        level = 0;
    }

    level += 1;

    if (!(token.type in this)) {
        throw new Error(
            'Missing compiler for node of type `' +
            token.type + '`: ' + token
        );
    }

    return this[token.type](token, parent, level);
};

/**
 * Visit all tokens.
 *
 * @param {Object} parent
 * @param {number} level
 * @return {Array.<string>}
 */
compilerPrototype.visitAll = function (parent, level) {
    var self = this;
    var tokens = parent.children;
    var values = [];
    var index = -1;
    var length = tokens.length;

    while (++index < length) {
        values[index] = self.visit(tokens[index], parent, level);
    }

    return values;
};

/**
 * Visit ordered list items.
 *
 * @param {Object} token
 * @param {number} level
 * @return {Array.<string>}
 */
compilerPrototype.visitOrderedItems = function (token, level) {
    var self = this;
    var values = [];
    var tokens = token.children;
    var index = -1;
    var length = tokens.length;
    var bullet;
    var indent;
    var spacing;

    level = level + 1;

    while (++index < length) {
        bullet = (index + 1) + DOT + SPACE;

        indent = Math.ceil(bullet.length / INDENT) * INDENT;
        spacing = repeat(indent - bullet.length, SPACE);

        values[index] = bullet + spacing +
            self.listItem(tokens[index], token, level, indent);
    }

    return values.join(LINE);
};

/**
 * Visit unordered list items.
 *
 * @param {Object} token
 * @param {number} level
 * @return {Array.<string>}
 */
compilerPrototype.visitUnorderedItems = function (token, level) {
    var self = this;
    var values = [];
    var tokens = token.children;
    var index = -1;
    var length = tokens.length;
    var bullet;
    var spacing;

    level = level + 1;

    /*
     * Unordered bullets are always one character, so
     * the following can be hard coded.
     */

    bullet = self.options.bullet + SPACE;
    spacing = repeat(HALF, SPACE);

    while (++index < length) {
        values[index] = bullet + spacing +
            self.listItem(tokens[index], token, level, INDENT);
    }

    return values.join(LINE);
};

/**
 * Stringify a root.
 *
 * @param {Object} token
 * @param {Object} parent
 * @param {number} level
 * @return {string}
 */
compilerPrototype.root = function (token, parent, level) {
    var self = this;
    var values = [];
    var tokens = token.children;
    var index = -1;
    var length = tokens.length;
    var child;
    var prev;

    while (++index < length) {
        child = tokens[index];

        if (prev) {
            /*
             * Duplicate tokens, such as a list
             * directly following another list,
             * often need multiple new lines.
             */

            if (child.type === prev.type && prev.type === 'list') {
                values.push(prev.ordered === child.ordered ? GAP : LINE);
            } else {
                values.push(BREAK);
            }
        }

        values.push(self.visit(child, token, level));

        prev = child;
    }

    values = values.join(EMPTY);

    if (values.charAt(values.length - 1) !== LINE) {
        values += LINE;
    }

    return values;
};

/**
 * Stringify a heading.
 *
 * @param {Object} token
 * @param {Object} parent
 * @param {number} level
 * @return {string}
 */
compilerPrototype.heading = function (token, parent, level) {
    var self = this;
    var setext = self.options.setext;
    var closeAtx = self.options.closeAtx;
    var depth = token.depth;
    var content = self.visitAll(token, level).join(EMPTY);
    var prefix;

    if (setext && (depth === 1 || depth === 2)) {
        return content + LINE +
            repeat(content.length, depth === 1 ? EQUALS : DASH);
    }

    prefix = repeat(token.depth, HASH);
    content = prefix + SPACE + content;

    if (closeAtx) {
        content += SPACE + prefix;
    }

    return content;
};

/**
 * Stringify text.
 *
 * @param {Object} token
 * @return {string}
 */
compilerPrototype.text = function (token) {
    return token.value;
};

/**
 * Stringify escaped text.
 *
 * @param {Object} token
 * @return {string}
 */
compilerPrototype.escape = function (token) {
    return '\\' + token.value;
};

/**
 * Stringify a paragraph.
 *
 * @param {Object} token
 * @param {Object} parent
 * @param {number} level
 * @return {string}
 */
compilerPrototype.paragraph = function (token, parent, level) {
    return this.visitAll(token, level).join(EMPTY);
};

/**
 * Stringify a block quote.
 *
 * @param {Object} token
 * @param {Object} parent
 * @param {number} level
 * @return {string}
 */
compilerPrototype.blockquote = function (token, parent, level) {
    return ANGLE_BRACKET_CLOSE + SPACE + this.visitAll(token, level)
        .join(BREAK).split(LINE).join(LINE + ANGLE_BRACKET_CLOSE + SPACE);
};

/**
 * Stringify a link.
 *
 * @param {Object} token
 * @param {Object} parent
 * @param {number} level
 * @return {string}
 */
compilerPrototype.link = function (token, parent, level) {
    var self = this;
    var link = token.href;
    var value;

    if (!self.options.referenceLinks && needsAngleBraceEnclosure(link)) {
        link = ANGLE_BRACKET_OPEN + link + ANGLE_BRACKET_CLOSE;
    }

    value = SQUARE_BRACKET_OPEN +
        self.visitAll(token, level).join(EMPTY) + SQUARE_BRACKET_CLOSE;

    if (token.title) {
        link += SPACE + encloseTitle(token.title);
    }

    if (self.options.referenceLinks) {
        value += SQUARE_BRACKET_OPEN + (++self.linkCounter) +
            SQUARE_BRACKET_CLOSE;

        self.links.push(
            SQUARE_BRACKET_OPEN + self.linkCounter + SQUARE_BRACKET_CLOSE +
            COLON + SPACE + link
        );
    } else {
        value += PARENTHESIS_OPEN + link + PARENTHESIS_CLOSE;
    }

    return value;
};

/**
 * Stringify a list.
 *
 * @param {Object} token
 * @param {Object} parent
 * @param {number} level
 * @return {string}
 */
compilerPrototype.list = function (token, parent, level) {
    return this[ORDERED_MAP[token.ordered]](token, level);
};

var CHECKBOX_MAP = {};

CHECKBOX_MAP.null = '';
CHECKBOX_MAP.undefined = '';
CHECKBOX_MAP.true = SQUARE_BRACKET_OPEN + 'x' + SQUARE_BRACKET_CLOSE + SPACE;
CHECKBOX_MAP.false = SQUARE_BRACKET_OPEN + SPACE + SQUARE_BRACKET_CLOSE +
    SPACE;

/**
 * Stringify a list item.
 *
 * @param {Object} token
 * @param {Object} parent
 * @param {number} level
 * @param {number} padding
 * @return {string}
 */
compilerPrototype.listItem = function (token, parent, level, padding) {
    var self = this;
    var tokens = token.children;
    var values = [];
    var index = -1;
    var length = tokens.length;
    var value;

    while (++index < length) {
        values[index] = self.visit(tokens[index], token, level);
    }

    value = CHECKBOX_MAP[token.checked] +
        values.join(token.loose ? BREAK : LINE);

    if (token.loose) {
        value += LINE;
    }

    value = pad(value, padding / INDENT);

    return trimLeft(value);
};

/**
 * Stringify inline code.
 *
 * @param {Object} token
 * @return {string}
 */
compilerPrototype.inlineCode = function (token) {
    var value = token.value;
    var ticks = repeat(getLongestRepetition(value, TICK) + 1, TICK);
    var start = ticks;
    var end = ticks;

    if (value.charAt(0) === TICK) {
        start += SPACE;
    }

    if (value.charAt(value.length - 1) === TICK) {
        end = SPACE + end;
    }

    return start + token.value + end;
};

/**
 * Stringify YAML front matter.
 *
 * @param {Object} token
 * @return {string}
 */
compilerPrototype.yaml = function (token) {
    var delimiter = repeat(3, DASH);
    var value = token.value ? LINE + token.value : EMPTY;

    return delimiter + value + LINE + delimiter;
};

/**
 * Stringify a code block.
 *
 * @param {Object} token
 * @return {string}
 */
compilerPrototype.code = function (token) {
    var value = token.value;
    var marker = this.options.fence;
    var fence;

    /*
     * Probably pedantic.
     */

    if (!token.lang && !this.options.fences && value) {
        return pad(value, 1);
    }

    fence = getLongestRepetition(value, marker) + 1;

    fence = repeat(Math.max(fence, MINIMUM_CODE_FENCE_LENGTH), marker);

    return fence + (token.lang || EMPTY) + LINE + value + LINE + fence;
};

/**
 * Stringify HTML.
 *
 * @return {string}
 */
compilerPrototype.html = function (token) {
    return token.value;
};

/**
 * Stringify a horizontal rule.
 *
 * @return {string}
 */
compilerPrototype.horizontalRule = function () {
    var options = this.options;
    var rule = repeat(options.ruleRepetition, options.rule);

    if (options.ruleSpaces) {
        rule = rule.split(EMPTY).join(SPACE);
    }

    return rule;
};

/**
 * Stringify a strong.
 *
 * @param {Object} token
 * @param {Object} parent
 * @param {number} level
 * @return {string}
 */
compilerPrototype.strong = function (token, parent, level) {
    var marker = this.options.strong;

    marker = marker + marker;

    return marker + this.visitAll(token, level).join(EMPTY) + marker;
};

/**
 * Stringify an emphasis.
 *
 * @param {Object} token
 * @param {Object} parent
 * @param {number} level
 * @return {string}
 */
compilerPrototype.emphasis = function (token, parent, level) {
    var marker = this.options.emphasis;

    return marker + this.visitAll(token, level).join(EMPTY) + marker;
};

/**
 * Stringify a break.
 *
 * @return {string}
 */
compilerPrototype.break = function () {
    return LINE;
};

/**
 * Stringify a delete.
 *
 * @param {Object} token
 * @param {Object} parent
 * @param {number} level
 * @return {string}
 */
compilerPrototype.delete = function (token, parent, level) {
    return DOUBLE_TILDE +
        this.visitAll(token, level).join(EMPTY) + DOUBLE_TILDE;
};

/**
 * Stringify an image.
 *
 * @param {Object} token
 * @return {string}
 */
compilerPrototype.image = function (token) {
    var source = token.src;
    var value;

    if (needsAngleBraceEnclosure(source)) {
        source = ANGLE_BRACKET_OPEN + source + ANGLE_BRACKET_CLOSE;
    }

    value = EXCLAMATION_MARK + SQUARE_BRACKET_OPEN + (token.alt || EMPTY) +
        SQUARE_BRACKET_CLOSE;

    value += PARENTHESIS_OPEN + source;

    if (token.title) {
        value += SPACE + encloseTitle(token.title);
    }

    value += PARENTHESIS_CLOSE;

    return value;
};

/**
 * Stringify a footnote.
 *
 * @param {Object} token
 * @return {string}
 */
compilerPrototype.footnote = function (token) {
    return SQUARE_BRACKET_OPEN + CARET + token.id + SQUARE_BRACKET_CLOSE;
};

/**
 * Stringify a footnote definition.
 *
 * @param {Object} token
 * @return {string}
 */
compilerPrototype.footnoteDefinition = function (token) {
    return this.visitAll(token).join(BREAK + repeat(INDENT, SPACE));
};

/**
 * Stringify table.
 *
 * @param {Object} token
 * @param {Object} parent
 * @param {number} level
 * @return {string}
 */
compilerPrototype.table = function (token, parent, level) {
    var self = this;
    var loose = self.options.looseTable;
    var spaced = self.options.spacedTable;
    var rows = token.children;
    var index = rows.length;
    var result = [];
    var start;

    while (index--) {
        result[index] = self.visitAll(rows[index], level);
    }

    start = loose ? EMPTY : spaced ? PIPE + SPACE : PIPE;

    /*
     * There was a bug in markdown-table@0.3.0, fixed
     * in markdown-table@0.3.1, which modified the `align`
     * array, changing the AST.
     */

    return table(result, {
        'align': token.align.concat(),
        'start': start,
        'end': start.split(EMPTY).reverse().join(EMPTY),
        'delimiter': spaced ? SPACE + PIPE + SPACE : PIPE
    });
};

/**
 * Stringify a table cell.
 *
 * @param {Object} token
 * @param {Object} parent
 * @param {number} level
 * @return {string}
 */
compilerPrototype.tableCell = function (token, parent, level) {
    return this.visitAll(token, level).join(EMPTY);
};

/**
 * Visit the footnote definition block.
 *
 * @param {Object} footnotes
 * @return {string}
 */
compilerPrototype.visitFootnoteDefinitions = function (footnotes) {
    var self = this;
    var keys = getKeys(footnotes);
    var index = -1;
    var length = keys.length;
    var results = [];
    var key;

    if (!length) {
        return EMPTY;
    }

    while (++index < length) {
        key = keys[index];

        results.push(
            SQUARE_BRACKET_OPEN + CARET + key + SQUARE_BRACKET_CLOSE +
            COLON + SPACE + self.visit(footnotes[key], null)
        );
    }

    return LINE + results.join(LINE) + LINE;
};

/**
 * Stringify an ast.
 *
 * @param {Object} ast
 * @param {Object?} options
 * @param {Function?} CustomCompiler
 * @return {string}
 */
function stringify(ast, options, CustomCompiler) {
    var compiler;
    var footnotes;
    var value;

    if (!CustomCompiler) {
        CustomCompiler = this.Compiler || Compiler;
    }

    compiler = new CustomCompiler(options);

    if (ast && ast.footnotes) {
        footnotes = copy({}, ast.footnotes);

        compiler.footnotes = footnotes;
    }

    value = compiler.visit(ast);

    if (compiler.links.length) {
        value += LINE + compiler.links.join(LINE) + LINE;
    }

    if (footnotes) {
        value += compiler.visitFootnoteDefinitions(footnotes);
    }

    return value;
}

/*
 * Expose `Compiler` on `stringify`.
 */

stringify.Compiler = Compiler;

/*
 * Expose `stringify` on `module.exports`.
 */

module.exports = stringify;
