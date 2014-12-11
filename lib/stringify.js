'use strict';

var compilerPrototype,
    table;

table = require('markdown-table');

function repeat(times, character) {
    return new Array(times + 1).join(character);
}

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

function Compiler(options) {
    this.options = options || {};
    this.footnoteCounter = 0;
}

compilerPrototype = Compiler.prototype;

compilerPrototype.visit = function (token, parent, level) {
    var result;

    if (!level) {
        level = 0;
    }

    level += 1;

    result = this[token.type](token, parent, level);

    return result;
};

compilerPrototype.visitAll = function (token, tokens, level) {
    var self = this,
        values = [],
        iterator = -1,
        length = tokens.length;

    while (++iterator < length) {
        values[iterator] = self.visit(tokens[iterator], token, level);
    }

    return values;
};

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

        /**
         * `html` tokens include their ending new lines.
         */

        if (prevType && prevType !== 'html') {
            /**
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

compilerPrototype.heading = function (token, parent, level) {
    return repeat(token.depth, '#') + ' ' +
        this.visitAll(token, token.children, level).join('');
};

compilerPrototype.text = function (token) {
    return token.value.replace(/[\\`*{}\[\]()#+\-.!_>]/g, '\\$&');
};

compilerPrototype.paragraph = function (token, parent, level) {
    return this.visitAll(token, token.children, level).join('');
};

compilerPrototype.blockquote = function (token, parent, level) {
    var result;

    result = this.visitAll(token, token.children, level);

    result = '> ' + result.join('\n\n').split('\n').join('\n> ');

    return result;
};

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

compilerPrototype.list = function (token, parent, level) {
    var methodName;

    methodName = token.ordered ? 'visitOrderedItems' : 'visitUnorderedItems';

    return this[methodName](token, token.children, level).join('\n');
  };

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

compilerPrototype.code = function (token) {
    var value,
        ticks;

    value = token.value;

    /**
     * Probably pedantic.
     */

    if (!token.lang) {
        return pad(value, 1);
    }

    ticks = Math.max(getLongestRepetition(value, '`') + 1, 3);

    ticks = repeat(ticks, '`');

    return ticks + token.lang + '\n' + value + '\n' + ticks;
};

compilerPrototype.html = function (token) {
    return token.value;
};

compilerPrototype.horizontalRule = function () {
    return '* * *';
};

compilerPrototype.strong = function (token, parent, level) {
    return '**' + this.visitAll(token, token.children, level).join('') + '**';
};

compilerPrototype.emphasis = function (token, parent, level) {
    return '*' + this.visitAll(token, token.children, level).join('') + '*';
};

compilerPrototype.break = function () {
    return '\n';
};

compilerPrototype.delete = function (token, parent, level) {
    return '~~' + this.visitAll(token, token.children, level).join('') + '~~';
};

compilerPrototype.image = function (token) {
    var value = '![' + (token.alt || '') + ']';

    value += '(' + token.src;

    if (token.title) {
        value += ' "' + token.title + '"';
    }

    value += ')';

    return value;
};

compilerPrototype.footnote = function (token) {
    return '[^' + token.id + ']';
};

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

compilerPrototype.tableCell = function (token, parent, level) {
    return this.visitAll(token, token.children, level).join('');
};

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
