'use strict';

/*
 * Dependencies.
 */

var table;

table = require('markdown-table');

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
 * Pad `value` with `level * 4` spaces.
 *
 * @param {string} value
 * @param {number} level
 * @return {string}
 */
function pad(value, level) {
    var index,
        padding;

    value = value.split('\n');

    index = value.length;
    padding = repeat(level * 4, ' ');

    while (index--) {
        if (value[index].length !== 0) {
            value[index] = padding + value[index];
        }
    }

    return value.join('\n');
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
    var self = this,
        values = [],
        iterator = -1,
        length = tokens.length;

    while (++iterator < length) {
        values[iterator] = self.visit(tokens[iterator], parent, level);
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
    var self = this,
        values = [],
        iterator = -1,
        length = tokens.length,
        indent;

    level = level + 1;

    while (++iterator < length) {
        indent = (iterator + 1) + '. ';

        values[iterator] = indent +
            self.listItem(tokens[iterator], token, level, indent.length);
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
    var self = this,
        values = [],
        iterator = -1,
        length = tokens.length,
        indent;

    level = level + 1;

    indent = '- ';

    while (++iterator < length) {
        values[iterator] = indent +
            self.listItem(tokens[iterator], token, level, indent.length);
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
    var self = this,
        values = [],
        iterator = -1,
        tokens = token.children,
        length = tokens.length,
        child,
        prevType;

    while (++iterator < length) {
        child = tokens[iterator];

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
                values.push('\n\n\n');
            } else {
                values.push('\n\n');
            }
        }

        values.push(self.visit(child, token, level));

        prevType = child.type;
    }

    return values.join('');
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
    return repeat(token.depth, '#') + ' ' +
        this.visitAll(token, token.children, level).join('');
};

/**
 * Stringify text.
 *
 * @param {Object} token
 * @return {string}
 */
compilerPrototype.text = function (token) {
    return token.value.replace(/[\\`*{}\[\]()#+\-.!_>]/g, '\\$&');
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
    return this.visitAll(token, token.children, level).join('');
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
    var result;

    result = this.visitAll(token, token.children, level);

    result = '> ' + result.join('\n\n').split('\n').join('\n> ');

    return result;
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
    var value = '[' +
        this.visitAll(token, token.children, level).join('') +
    ']';

    value += '(' + token.href;

    if (token.title) {
        value += ' "' + token.title + '"';
    }

    value += ')';

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

    return this[methodName](token, token.children, level).join('\n');
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
        iterator,
        length,
        value;

    self = this;

    tokens = token.children;

    values = [];

    iterator = -1;
    length = tokens.length;

    while (++iterator < length) {
        values[iterator] = self.visit(tokens[iterator], token, level);
    }

    value = values.join(repeat(token.loose ? 2 : 1, '\n'));

    if (token.loose) {
        value += '\n';
    }

    value = pad(value, padding / 4);

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

    ticks = repeat(getLongestRepetition(value, '`') + 2, '`');

    start = ticks;
    end = ticks;

    if (value.charAt(0) === '`') {
        start += ' ';
    }

    if (value.charAt(value.length - 1) === '`') {
        end = ' ' + end;
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

    ticks = Math.max(getLongestRepetition(value, '`') + 1, 3);

    ticks = repeat(ticks, '`');

    return ticks + token.lang + '\n' + value + '\n' + ticks;
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
    return '* * *';
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
    return '**' + this.visitAll(token, token.children, level).join('') + '**';
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
    return '*' + this.visitAll(token, token.children, level).join('') + '*';
};

/**
 * Stringify a break.
 *
 * @return {string}
 */
compilerPrototype.break = function () {
    return '\n';
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
    return '~~' + this.visitAll(token, token.children, level).join('') + '~~';
};

/**
 * Stringify an image.
 *
 * @param {Object} token
 * @return {string}
 */
compilerPrototype.image = function (token) {
    var value = '![' + (token.alt || '') + ']';

    value += '(' + token.src;

    if (token.title) {
        value += ' "' + token.title + '"';
    }

    value += ')';

    return value;
};

/**
 * Stringify a footnote.
 *
 * @param {Object} token
 * @return {string}
 */
compilerPrototype.footnote = function (token) {
    return '[^' + token.id + ']';
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
    return this.visitAll(token, token.children, level).join('');
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
        footnotes = '';

        footnotes = '\n\n' + Object.keys(token.footnotes).map(function (key) {
            var footnote;

            footnote = token.footnotes[key];

            return '[^' + key + ']: ' + compiler.visitAll(
                null, footnote
            ).join('\n\n' + repeat(4, ' '));
        }).join('\n\n');

        value += footnotes;
    }

    return value;
}

module.exports = stringify;
