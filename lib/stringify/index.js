'use strict';

var compilerPrototype,
    table;

table = require('markdown-table');

function repeat(times, character) {
    return Array(times + 1).join(character);
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
        length = tokens.length;

    level = level + 1;

    while (++iterator < length) {
        values[iterator] = (iterator + 1) + '. ' +
            self.listItem(tokens[iterator], level);
    }

    return values;
};

compilerPrototype.visitUnorderedItems = function (token, tokens, level) {
    var self = this,
        values = [],
        iterator = -1,
        length = tokens.length;

    level = level + 1;

    while (++iterator < length) {
        values[iterator] = '- ' + self.listItem(tokens[iterator], level);
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
    var methodName,
        result;

    methodName = token.ordered ? 'visitOrderedItems' :
        'visitUnorderedItems';

    result = this[methodName](token, token.children, level);

    // console.log('list: ', result);

    return result.join('\n');
};

compilerPrototype.listItem = function (token, parent, level) {
    var self = this,
        tokens = token.children,
        child,
        values,
        iterator,
        length,
        type,
        value;

    values = [];
    iterator = -1;
    length = tokens.length;

    while (++iterator < length) {
        child = tokens[iterator];

        values.push(self.visit(child, token, level));

        /**
         * `paragraphs` miss a new-line.
         */

        type = child.type;

        value = '';

        if (type === 'paragraph' || type === 'list') {
            value += '\n';
        }

        if (iterator !== length - 1) {
            value += '\n';
        }

        if (value) {
            values.push(value);
        }
    }

    value = values.join('');

    if (length === 1) {
        value = pad(value, 0.5);
    } else {
        value = pad(value, 1);
    }

    // console.log('list-item: ', length === 1, [value]);

    value = value.trimLeft();

    return value;
};

compilerPrototype.inlineCode = function (token) {
    var innerBackticks,
        backticks;

    innerBackticks = token.value.match(/`+/g);
    backticks = 1;

    if (innerBackticks) {
        innerBackticks.forEach(function (ticks) {
            if (ticks.length > backticks) {
                backticks = ticks.length;
            }
        });

        backticks++;
    }

    backticks = repeat(backticks, '`');

    return backticks + token.value + backticks;
};

compilerPrototype.code = function (token) {
    var backticks,
        value;

    /**
     * Probably pedantic.
     */

    if (!token.lang) {
        return pad(token.value, 1) + '\n';
    }

    backticks = token.value.match(/`+/);

    backticks = backticks ? backticks[0].length : 0;

    backticks = repeat(Math.max(backticks + 1, 3), '`');

    value = backticks + token.lang + '\n' +
        token.value + '\n' +
        backticks + '\n';

    return value;
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
        'align' : align
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
