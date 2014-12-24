'use strict';

/*
 * Dependencies.
 */

var table;

table = require('markdown-table');

/*
 * Expressions.
 */

var ESCAPE_CHARACTERS;

ESCAPE_CHARACTERS = /[\\`*{}\[\]()#+\-.!_>]/g;

/*
 * Constants.
 */

var INDENT,
    MINIMUM_CODE_FENCE_LENGTH;

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
    EXCLAMATION_MARK,
    HASH,
    LINE,
    PARENTHESIS_OPEN,
    PARENTHESIS_CLOSE,
    QUOTE_DOUBLE,
    SPACE,
    SQUARE_BRACKET_OPEN,
    SQUARE_BRACKET_CLOSE,
    TICK,
    TILDE;

ANGLE_BRACKET = '>';
ASTERISK = '*';
CARET = '^';
COLON = ':';
DASH = '-';
DOT = '.';
EMPTY = '';
EXCLAMATION_MARK = '!';
HASH = '#';
LINE = '\n';
PARENTHESIS_OPEN = '(';
PARENTHESIS_CLOSE = ')';
QUOTE_DOUBLE = '"';
SPACE = ' ';
SQUARE_BRACKET_OPEN = '[';
SQUARE_BRACKET_CLOSE = ']';
TICK = '`';
TILDE = '~';

/*
 * Character combinations.
 */

var BREAK,
    GAP,
    DOUBLE_TILDE;

BREAK = LINE + LINE;
GAP = BREAK + LINE;
DOUBLE_TILDE = TILDE + TILDE;

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
        } else {
            if (currentCount > highestCount) {
                highestCount = currentCount;
            }

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
    this.options = options || {};
    this.footnoteCounter = 0;
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
        indent;

    self = this;
    values = [];
    index = -1;
    length = tokens.length;

    level = level + 1;

    while (++index < length) {
        indent = (index + 1) + DOT + SPACE;

        values[index] = indent +
            self.listItem(tokens[index], token, level, indent.length);
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
        indent;

    self = this;
    values = [];
    index = -1;
    length = tokens.length;

    level = level + 1;

    indent = DASH + SPACE;

    while (++index < length) {
        values[index] = indent +
            self.listItem(tokens[index], token, level, indent.length);
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

        /*
         * `html` tokens include their ending new lines.
         */

        if (prevType && prevType !== 'html') {
            /*
             * Duplicate tokens, such as a list
             * directly following another list,
             * often need multiple new lines.
             */

            if (child.type === prevType) {
                values.push(GAP);
            } else {
                values.push(BREAK);
            }
        }

        values.push(self.visit(child, token, level));

        prevType = child.type;
    }

    return values.join(EMPTY);
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
    return repeat(token.depth, HASH) + SPACE +
        this.visitAll(token, token.children, level).join(EMPTY);
};

/**
 * Stringify text.
 *
 * @param {Object} token
 * @return {string}
 */
compilerPrototype.text = function (token) {
    return token.value.replace(ESCAPE_CHARACTERS, '\\$&');
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
    var value;

    value = SQUARE_BRACKET_OPEN +
        this.visitAll(token, token.children, level).join(EMPTY) +
        SQUARE_BRACKET_CLOSE;

    value += PARENTHESIS_OPEN + token.href;

    if (token.title) {
        value += SPACE + QUOTE_DOUBLE + token.title + QUOTE_DOUBLE;
    }

    value += PARENTHESIS_CLOSE;

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

    return value.trimLeft();
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

    ticks = repeat(getLongestRepetition(value, TICK) + 2, TICK);

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
 * Stringify a code block.
 *
 * @param {Object} token
 * @return {string}
 */
compilerPrototype.code = function (token) {
    var value,
        ticks;

    value = token.value;

    /*
     * Probably pedantic.
     */

    if (!token.lang) {
        return pad(value, 1);
    }

    ticks = getLongestRepetition(value, TICK) + 1;

    ticks = repeat(Math.max(ticks, MINIMUM_CODE_FENCE_LENGTH), TICK);

    return ticks + token.lang + LINE + value + LINE + ticks;
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
    return ASTERISK + SPACE + ASTERISK + SPACE + ASTERISK;
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
    return ASTERISK + ASTERISK +
        this.visitAll(token, token.children, level).join(EMPTY) +
        ASTERISK + ASTERISK;
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
    return ASTERISK +
        this.visitAll(token, token.children, level).join(EMPTY) +
        ASTERISK;
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
    return SQUARE_BRACKET_OPEN + CARET + token.id + SQUARE_BRACKET_CLOSE;
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
    var align,
        self,
        cells;

    align = token.align.map(function (alignment) {
        return alignment.charAt(0);
    });

    self = this;

    cells = token.children.map(function (row) {
        return self.visitAll(row, row.children, level);
    });

    return table(cells, {
        'align': align
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
 * Stringify an AST token.
 *
 * @param {Object} token
 * @param {Object?} options
 * @return {string}
 */
function stringify(token, options) {
    var compiler,
        footnotes,
        value;

    compiler = new Compiler(options);

    if (token.footnotes) {
        compiler.footnotes = token.footnotes;
        compiler.footnoteMap = {};
    }

    value = compiler.visit(token);

    if (token.footnotes) {
        footnotes = BREAK + Object.keys(token.footnotes).map(function (key) {
            var footnote;

            footnote = token.footnotes[key];

            return SQUARE_BRACKET_OPEN + CARET + key + SQUARE_BRACKET_CLOSE +
                COLON + SPACE + compiler.visitAll(null, footnote).join(
                    BREAK + repeat(INDENT, SPACE)
                );
        }).join(BREAK);

        value += footnotes;
    }

    return value;
}

module.exports = stringify;
