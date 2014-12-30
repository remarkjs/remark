'use strict';

/*
 * Dependencies.
 */

var table,
    utilities;

table = require('markdown-table');
utilities = require('./utilities.js');

/*
 * Expressions.
 */

var EXPRESSION_ESCAPE,
    EXPRESSION_DIGIT;

EXPRESSION_ESCAPE = /[\\`*{}\[\]()#+\-._>]/g;
EXPRESSION_DIGIT = /\d/;

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
    EQUALS,
    EXCLAMATION_MARK,
    HASH,
    LINE,
    PARENTHESIS_OPEN,
    PARENTHESIS_CLOSE,
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
 * Throw an exception with in its message the value,
 * and its name.
 *
 * @param {*} value
 * @param {string} name
 */
function raise(value, name) {
    throw new Error(
        'Invalid value `' + value + '` ' +
        'for `' + name + '`'
    );
}

/**
 * Construct a new compiler.
 *
 * @param {Object?} options
 * @constructor Compiler
 */
function Compiler(options) {
    var self,
        bullet,
        horizontalRule,
        horizontalRuleSpaces,
        horizontalRuleRepetition,
        preferSetextHeadings,
        preferReferenceLinks,
        preferReferenceFootnotes,
        preferFences,
        emphasis,
        strong;

    self = this;

    self.footnoteCounter = 0;
    self.linkCounter = 0;
    self.links = [];

    if (options === null || options === undefined) {
        options = {};
    } else if (typeof options !== 'object') {
        raise(options, 'options');
    }

    bullet = options.bullet;
    horizontalRule = options.horizontalRule;
    horizontalRuleSpaces = options.horizontalRuleSpaces;
    horizontalRuleRepetition = options.horizontalRuleRepetition;
    preferSetextHeadings = options.preferSetextHeadings;
    preferReferenceLinks = options.preferReferenceLinks;
    preferReferenceFootnotes = options.preferReferenceFootnotes;
    preferFences = options.preferFences;
    emphasis = options.emphasis;
    strong = options.strong;

    if (!bullet) {
        options.bullet = DASH;
    } else if (!(bullet in LIST_BULLETS)) {
        raise(bullet, 'options.bullet');
    }

    if (!horizontalRule) {
        options.horizontalRule = ASTERISK;
    } else if (!(horizontalRule in HORIZONTAL_RULE_BULLETS)) {
        raise(horizontalRule, 'options.horizontalRule');
    }

    if (horizontalRuleSpaces === null || horizontalRuleSpaces === undefined) {
        options.horizontalRuleSpaces = true;
    } else if (typeof horizontalRuleSpaces !== 'boolean') {
        raise(horizontalRuleSpaces, 'options.horizontalRuleSpaces');
    }

    if (emphasis === null || emphasis === undefined) {
        options.emphasis = UNDERSCORE;
    } else if (!(emphasis in EMPHASIS_MARKERS)) {
        raise(emphasis, 'options.emphasis');
    }

    if (strong === null || strong === undefined) {
        options.strong = ASTERISK;
    } else if (!(strong in EMPHASIS_MARKERS)) {
        raise(strong, 'options.strong');
    }

    if (preferSetextHeadings === null || preferSetextHeadings === undefined) {
        options.preferSetextHeadings = false;
    } else if (typeof preferSetextHeadings !== 'boolean') {
        raise(preferSetextHeadings, 'options.preferSetextHeadings');
    }

    if (preferReferenceLinks === null || preferReferenceLinks === undefined) {
        options.preferReferenceLinks = false;
    } else if (typeof preferReferenceLinks !== 'boolean') {
        raise(preferReferenceLinks, 'options.preferReferenceLinks');
    }

    if (
        preferReferenceFootnotes === null ||
        preferReferenceFootnotes === undefined
    ) {
        options.preferReferenceFootnotes = true;
    } else if (typeof preferReferenceFootnotes !== 'boolean') {
        raise(preferReferenceFootnotes, 'options.preferReferenceFootnotes');
    }

    if (preferFences === null || preferFences === undefined) {
        options.preferFences = false;
    } else if (typeof preferFences !== 'boolean') {
        raise(preferFences, 'options.preferFences');
    }

    if (
        horizontalRuleRepetition === null ||
        horizontalRuleRepetition === undefined
    ) {
        options.horizontalRuleRepetition = 3;
    } else if (
        typeof horizontalRuleRepetition !== 'number' ||
        horizontalRuleRepetition < 3 ||
        horizontalRuleRepetition !== horizontalRuleRepetition
    ) {
        raise(horizontalRuleRepetition, 'options.horizontalRuleRepetition');
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

    indent = this.options.bullet + SPACE;

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
    var preferSetextHeadings,
        depth,
        content;

    preferSetextHeadings = this.options.preferSetextHeadings;

    depth = token.depth;

    content = this.visitAll(token, token.children, level).join(EMPTY);

    if (
        preferSetextHeadings &&
        (
            depth === 1 ||
            depth === 2
        )
    ) {
        return content + LINE +
            repeat(content.length, depth === 1 ? EQUALS : DASH);
    }

    return repeat(token.depth, HASH) + SPACE + content;
};

/**
 * Stringify text.
 *
 * @param {Object} token
 * @return {string}
 */
compilerPrototype.text = function (token) {
    return token.value.replace(EXPRESSION_ESCAPE, function ($0, index) {
        if (
            $0 === DOT &&
            !EXPRESSION_DIGIT.test(token.value.charAt(index - 1))
        ) {
            return $0;
        }

        return '\\' + $0;
    });
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

    if (self.options.preferReferenceLinks) {
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

    if (!token.lang && !this.options.preferFences) {
        return pad(value, 1);
    }

    ticks = getLongestRepetition(value, TICK) + 1;

    ticks = repeat(Math.max(ticks, MINIMUM_CODE_FENCE_LENGTH), TICK);

    return ticks + (token.lang || '') + LINE + value + LINE + ticks;
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

    rule = repeat(options.horizontalRuleRepetition, options.horizontalRule);

    if (options.horizontalRuleSpaces) {
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
     * Check if the user prefers inline footnotes.
     * But, only expose footnotes inline when the
     * footnote contains just one paragraph.
     */

    if (
        this.options.preferReferenceFootnotes ||
        footnote.length !== 1 ||
        footnote[0].type !== 'paragraph'
    ) {
        return SQUARE_BRACKET_OPEN + CARET + token.id + SQUARE_BRACKET_CLOSE;
    }

    this.footnotes[token.id] = false;

    return SQUARE_BRACKET_OPEN + CARET + this.visit(footnote[0], null) +
        SQUARE_BRACKET_CLOSE;
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
        result;

    self = this;

    rows = token.children;

    index = rows.length;

    result = [];

    while (index--) {
        result[index] = self.visitAll(
            rows[index], rows[index].children, level
        );
    }

    /*
     * There was a bug in markdown-table@0.3.0, fixed
     * in markdown-table@0.3.1, which modified the `align`
     * array, changing the AST.
     */

    return table(result, {
        'align': token.align.concat()
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
                self.visitAll(null, footnotes[key])
                .join(BREAK + repeat(INDENT, SPACE));
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
        footnotes = utilities.copy({}, token.footnotes);

        compiler.footnotes = footnotes;
    }

    value = compiler.visit(token);

    if (compiler.links.length) {
        value += LINE + compiler.links.join(LINE) + LINE;
    }

    if (footnotes) {
        value += compiler.visitFootnoteDefinitions(footnotes);
    }

    return value;
}

module.exports = stringify;
