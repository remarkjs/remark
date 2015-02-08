'use strict';

/*
 * Dependencies.
 */

var table,
    utilities;

table = require('markdown-table');
utilities = require('./utilities.js');

/*
 * Cached methods.
 */

var copy,
    raise,
    trimLeft,
    validate;

copy = utilities.copy;
raise = utilities.raise;
trimLeft = utilities.trimLeft;
validate = utilities.validate;

/*
 * Expressions.
 */

var EXPRESSION_TRAILING_NEW_LINES;

EXPRESSION_TRAILING_NEW_LINES = /\n+$/g;

/*
 * Constants.
 */

var HALF,
    INDENT,
    MINIMUM_CODE_FENCE_LENGTH;

HALF = 2;
INDENT = 4;
MINIMUM_CODE_FENCE_LENGTH = 3;

/*
 * Characters.
 */

var ANGLE_BRACKET,
    ASTERISK,
    CARET,
    COLON,
    DASH,
    DOT,
    EMPTY,
    EQUALS,
    EXCLAMATION_MARK,
    HASH,
    LINE,
    PARENTHESIS_OPEN,
    PARENTHESIS_CLOSE,
    PIPE,
    PLUS,
    QUOTE_DOUBLE,
    SPACE,
    SQUARE_BRACKET_OPEN,
    SQUARE_BRACKET_CLOSE,
    TICK,
    TILDE,
    UNDERSCORE;

ANGLE_BRACKET = '>';
ASTERISK = '*';
CARET = '^';
COLON = ':';
DASH = '-';
DOT = '.';
EMPTY = '';
EQUALS = '=';
EXCLAMATION_MARK = '!';
HASH = '#';
LINE = '\n';
PARENTHESIS_OPEN = '(';
PARENTHESIS_CLOSE = ')';
PIPE = '|';
PLUS = '+';
QUOTE_DOUBLE = '"';
SPACE = ' ';
SQUARE_BRACKET_OPEN = '[';
SQUARE_BRACKET_CLOSE = ']';
TICK = '`';
TILDE = '~';
UNDERSCORE = '_';

/*
 * Character combinations.
 */

var BREAK,
    GAP,
    DOUBLE_TILDE;

BREAK = LINE + LINE;
GAP = BREAK + LINE;
DOUBLE_TILDE = TILDE + TILDE;

/*
 * Define allowed list-bullet characters.
 */

var LIST_BULLETS;

LIST_BULLETS = {};

LIST_BULLETS[ASTERISK] = true;
LIST_BULLETS[DASH] = true;
LIST_BULLETS[PLUS] = true;

/*
 * Define allowed horizontal-rule bullet characters.
 */

var HORIZONTAL_RULE_BULLETS;

HORIZONTAL_RULE_BULLETS = {};

HORIZONTAL_RULE_BULLETS[ASTERISK] = true;
HORIZONTAL_RULE_BULLETS[DASH] = true;
HORIZONTAL_RULE_BULLETS[UNDERSCORE] = true;

/*
 * Define allowed emphasis characters.
 */

var EMPHASIS_MARKERS;

EMPHASIS_MARKERS = {};

EMPHASIS_MARKERS[UNDERSCORE] = true;
EMPHASIS_MARKERS[ASTERISK] = true;

/*
 * Define allowed emphasis characters.
 */

var FENCE_MARKERS;

FENCE_MARKERS = {};

FENCE_MARKERS[TICK] = true;
FENCE_MARKERS[TILDE] = true;

/**
 * Helper to get the keys in an object.
 *
 * @param {Object} object
 * @return {Array.<string>}
 */
function getKeys(object) {
    var results,
        key;

    results = [];

    for (key in object) {
        results.push(key);
    }

    return results;
}

/**
 * Repeat `character` `times` times.
 *
 * @param {number} times
 * @param {string} character
 * @return {string}
 */
function repeat(times, character) {
    return new Array(times + 1).join(character);
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
    var index,
        length,
        currentCount,
        highestCount,
        currentCharacter;

    highestCount = 0;

    index = -1;
    length = value.length;

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
    var index,
        padding;

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
    var self,
        ruleRepetition;

    self = this;

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

    validate.map(options, 'bullet', LIST_BULLETS, DASH);
    validate.map(options, 'rule', HORIZONTAL_RULE_BULLETS, ASTERISK);
    validate.map(options, 'emphasis', EMPHASIS_MARKERS, UNDERSCORE);
    validate.map(options, 'strong', EMPHASIS_MARKERS, ASTERISK);
    validate.map(options, 'fence', FENCE_MARKERS, TICK);
    validate.bool(options, 'ruleSpaces', true);
    validate.bool(options, 'setext', false);
    validate.bool(options, 'closeAtx', false);
    validate.bool(options, 'looseTable', false);
    validate.bool(options, 'spacedTable', true);
    validate.bool(options, 'referenceLinks', false);
    validate.bool(options, 'referenceFootnotes', true);
    validate.bool(options, 'fences', false);
    validate.num(options, 'ruleRepetition', 3);

    ruleRepetition = options.ruleRepetition;

    if (ruleRepetition < 3 || ruleRepetition !== ruleRepetition) {
        raise(ruleRepetition, 'options.ruleRepetition');
    }

    self.options = options;
}

/*
 * Cache prototype.
 */

var compilerPrototype;

compilerPrototype = Compiler.prototype;

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
 * @param {Array.<Object>} tokens
 * @param {number} level
 * @return {Array.<string>}
 */
compilerPrototype.visitAll = function (parent, tokens, level) {
    var self,
        values,
        index,
        length;

    self = this;

    values = [];

    index = -1;
    length = tokens.length;

    while (++index < length) {
        values[index] = self.visit(tokens[index], parent, level);
    }

    return values;
};

/**
 * Visit ordered list items.
 *
 * @param {Object} token
 * @param {Array.<Object>} tokens
 * @param {number} level
 * @return {Array.<string>}
 */
compilerPrototype.visitOrderedItems = function (token, tokens, level) {
    var self,
        values,
        index,
        length,
        bullet,
        indent;

    self = this;
    values = [];
    index = -1;
    length = tokens.length;

    level = level + 1;

    while (++index < length) {
        bullet = (index + 1) + DOT + SPACE;
        indent = Math.ceil(bullet.length / HALF) * HALF;

        values[index] = bullet +
            self.listItem(tokens[index], token, level, indent);
    }

    return values;
};

/**
 * Visit unordered list items.
 *
 * @param {Object} token
 * @param {Array.<Object>} tokens
 * @param {number} level
 * @return {Array.<string>}
 */
compilerPrototype.visitUnorderedItems = function (token, tokens, level) {
    var self,
        values,
        index,
        length,
        bullet,
        indent;

    self = this;
    values = [];
    index = -1;
    length = tokens.length;

    level = level + 1;

    bullet = this.options.bullet + SPACE;
    indent = Math.ceil(bullet.length / HALF) * HALF;

    while (++index < length) {
        values[index] = bullet +
            self.listItem(tokens[index], token, level, indent);
    }

    return values;
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
    var self,
        values,
        tokens,
        index,
        length,
        child,
        prevType;

    self = this;
    values = [];
    index = -1;
    tokens = token.children;
    length = tokens.length;

    while (++index < length) {
        child = tokens[index];

        if (prevType) {
            /*
             * Duplicate tokens, such as a list
             * directly following another list,
             * often need multiple new lines.
             */

            if (child.type === prevType && prevType === 'list') {
                values.push(GAP);
            } else {
                values.push(BREAK);
            }
        }

        values.push(self.visit(child, token, level));

        prevType = child.type;
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
    var setext,
        closeAtx,
        depth,
        content,
        prefix;

    setext = this.options.setext;
    closeAtx = this.options.closeAtx;

    depth = token.depth;

    content = this.visitAll(token, token.children, level).join(EMPTY);

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
    return this.visitAll(token, token.children, level).join(EMPTY);
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
    return ANGLE_BRACKET + SPACE +
        this.visitAll(token, token.children, level).join(BREAK).split(LINE)
        .join(LINE + ANGLE_BRACKET + SPACE);
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
    var self,
        value,
        link;

    self = this;

    value = SQUARE_BRACKET_OPEN +
        self.visitAll(token, token.children, level).join(EMPTY) +
        SQUARE_BRACKET_CLOSE;

    link = token.href;

    if (token.title) {
        link += SPACE + QUOTE_DOUBLE + token.title + QUOTE_DOUBLE;
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
    var methodName;

    methodName = token.ordered ? 'visitOrderedItems' : 'visitUnorderedItems';

    return this[methodName](token, token.children, level).join(LINE);
};

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
    var self,
        tokens,
        values,
        index,
        length,
        value;

    self = this;

    tokens = token.children;

    values = [];

    index = -1;
    length = tokens.length;

    while (++index < length) {
        values[index] = self.visit(tokens[index], token, level);
    }

    value = values.join(token.loose ? BREAK : LINE);

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
    var value,
        ticks,
        start,
        end;

    value = token.value;

    ticks = repeat(getLongestRepetition(value, TICK) + 1, TICK);

    start = ticks;
    end = ticks;

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
    var delimiter,
        value;

    delimiter = repeat(3, DASH);
    value = token.value ? LINE + token.value : EMPTY;

    return delimiter + value + LINE + delimiter;
};

/**
 * Stringify a code block.
 *
 * @param {Object} token
 * @return {string}
 */
compilerPrototype.code = function (token) {
    var value,
        fence,
        marker;

    value = token.value;
    marker = this.options.fence;

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
    var options,
        rule;

    options = this.options;

    rule = repeat(options.ruleRepetition, options.rule);

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
    var marker;

    marker = this.options.strong;

    marker = marker + marker;

    return marker + this.visitAll(token, token.children, level).join(EMPTY) +
        marker;
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
    var marker;

    marker = this.options.emphasis;

    return marker + this.visitAll(token, token.children, level).join(EMPTY) +
        marker;
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
        this.visitAll(token, token.children, level).join(EMPTY) +
        DOUBLE_TILDE;
};

/**
 * Stringify an image.
 *
 * @param {Object} token
 * @return {string}
 */
compilerPrototype.image = function (token) {
    var value;

    value = EXCLAMATION_MARK + SQUARE_BRACKET_OPEN + (token.alt || EMPTY) +
        SQUARE_BRACKET_CLOSE;

    value += PARENTHESIS_OPEN + token.src;

    if (token.title) {
        value += SPACE + QUOTE_DOUBLE + token.title + QUOTE_DOUBLE;
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
    var footnote;

    footnote = this.footnotes[token.id];

    /*
     * Check if the user s inline footnotes.
     * But, only expose footnotes inline when the
     * footnote contains just one paragraph.
     */

    if (
        this.options.referenceFootnotes ||
        footnote.children.length !== 1 ||
        footnote.children[0].type !== 'paragraph'
    ) {
        return SQUARE_BRACKET_OPEN + CARET + token.id + SQUARE_BRACKET_CLOSE;
    }

    this.footnotes[token.id] = false;

    return SQUARE_BRACKET_OPEN + CARET + this.visit(footnote, null) +
        SQUARE_BRACKET_CLOSE;
};

/**
 * Stringify a footnote definition.
 *
 * @param {Object} token
 * @return {string}
 */
compilerPrototype.footnoteDefinition = function (token) {
    return this.visitAll(token, token.children)
        .join(BREAK + repeat(INDENT, SPACE));
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
    var self,
        index,
        rows,
        result,
        loose,
        spaced,
        start;

    self = this;

    loose = self.options.looseTable;
    spaced = self.options.spacedTable;

    rows = token.children;

    index = rows.length;

    result = [];

    while (index--) {
        result[index] = self.visitAll(
            rows[index], rows[index].children, level
        );
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
    return this.visitAll(token, token.children, level).join(EMPTY);
};

/**
 * Visit the footnote definition block.
 *
 * @param {Object} footnotes
 * @return {string}
 */
compilerPrototype.visitFootnoteDefinitions = function (footnotes) {
    var self,
        keys,
        key,
        index,
        length,
        results;

    self = this;

    keys = getKeys(footnotes);

    /*
     * First stringify the footnotes definitions,
     * because new footnote references could be found.
     */

    index = -1;
    length = keys.length;

    while (++index < length) {
        key = keys[index];

        if (footnotes[key]) {
            footnotes[key] = SQUARE_BRACKET_OPEN + CARET + key +
                SQUARE_BRACKET_CLOSE + COLON + SPACE +
                self.visit(footnotes[key], null);
        }
    }

    /*
     * Then, all footnotes that are stringified
     * inline, are set to `false`. The reset, we
     * add to the buffer below.
     */

    results = [];

    index = -1;

    while (++index < length) {
        key = keys[index];

        if (footnotes[key] !== false) {
            results.push(footnotes[key]);
        }
    }

    if (results.length) {
        return LINE + results.join(LINE) + LINE;
    }

    return EMPTY;
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
    var compiler,
        footnotes,
        value;

    compiler = new (CustomCompiler || Compiler)(options);

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

    return value.replace(EXPRESSION_TRAILING_NEW_LINES, LINE);
}

/*
 * Expose `Compiler` on `stringify`.
 */

stringify.Compiler = Compiler;

/*
 * Expose `stringify` on `module.exports`.
 */

module.exports = stringify;
