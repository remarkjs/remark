'use strict';

/*
 * Dependencies.
 */

var he = require('he');
var repeat = require('repeat-string');
var utilities = require('./utilities.js');
var defaultExpressions = require('./expressions.js');
var defaultOptions = require('./defaults.js').parse;

/*
 * Methods.
 */

var clone = utilities.clone;
var copy = utilities.copy;
var raise = utilities.raise;
var trim = utilities.trim;
var trimRightLines = utilities.trimRightLines;
var clean = utilities.clean;
var validate = utilities.validate;
var normalize = utilities.normalizeIdentifier;
var objectCreate = utilities.create;

/*
 * Characters.
 */

var AT_SIGN = '@';
var CARET = '^';
var EQUALS = '=';
var EXCLAMATION_MARK = '!';
var MAILTO_PROTOCOL = 'mailto:';
var NEW_LINE = '\n';
var SPACE = ' ';
var TAB = '\t';
var EMPTY = '';
var LT = '<';
var GT = '>';
var BRACKET_OPEN = '[';

/*
 * Types.
 */

var BLOCK = 'block';
var INLINE = 'inline';
var HORIZONTAL_RULE = 'horizontalRule';
var HTML = 'html';
var YAML = 'yaml';
var TABLE = 'table';
var TABLE_CELL = 'tableCell';
var TABLE_HEADER = 'tableHeader';
var TABLE_ROW = 'tableRow';
var PARAGRAPH = 'paragraph';
var TEXT = 'text';
var CODE = 'code';
var LIST = 'list';
var LIST_ITEM = 'listItem';
var FOOTNOTE_DEFINITION = 'footnoteDefinition';
var HEADING = 'heading';
var BLOCKQUOTE = 'blockquote';
var LINK = 'link';
var IMAGE = 'image';
var FOOTNOTE = 'footnote';
var ESCAPE = 'escape';
var STRONG = 'strong';
var EMPHASIS = 'emphasis';
var DELETE = 'delete';
var INLINE_CODE = 'inlineCode';
var BREAK = 'break';
var ROOT = 'root';

/**
 * Wrapper arround he's `decode` function.
 *
 * @param {string} value
 * @param {function(string)} eat
 * @return {string}
 */
function decode(value, eat) {
    try {
        return he.decode(value);
    } catch (exception) {
        eat.file.fail(exception.message, eat.now());
    }
}

/**
 * Factory to de-escape a value, based on an expression
 * at `key` in `scope`.
 *
 * @param {Object} scope
 * @param {string} key
 * @return {function(string): string}
 */
function descapeFactory(scope, key) {
    var globalExpression;
    var expression;

    /**
     * Private method to get a global expression
     * from the expression at `key` in `scope`.
     *
     * @return {RegExp}
     */
    function generate() {
        if (scope[key] !== globalExpression) {
            globalExpression = scope[key];
            expression = new RegExp(
                scope[key].source.replace(CARET, EMPTY), 'g'
            );
        }

        return expression;
    }

    /**
     * De-escape a string.
     *
     * @param {string} value
     * @return {string}
     */
    function descape(value) {
        return value.replace(generate(), '$1');
    }

    return descape;
}

/*
 * Tab size.
 */

var TAB_SIZE = 4;

/*
 * Expressions.
 */

var EXPRESSION_RIGHT_ALIGNMENT = /^[ \t]*-+:[ \t]*$/;
var EXPRESSION_CENTER_ALIGNMENT = /^[ \t]*:-+:[ \t]*$/;
var EXPRESSION_LEFT_ALIGNMENT = /^[ \t]*:-+[ \t]*$/;
var EXPRESSION_TABLE_FENCE = /^[ \t]*|\|[ \t]*$/g;
var EXPRESSION_TABLE_INITIAL = /^[ \t]*\|[ \t]*/g;
var EXPRESSION_TABLE_CONTENT =
    /((?:\\[\s\S]|[^\|])+?)([ \t]?\|[ \t]?\n?|\n?$)/g;
var EXPRESSION_TABLE_BORDER = /[ \t]*\|[ \t]*/;
var EXPRESSION_BLOCK_QUOTE = /^[ \t]*>[ \t]?/gm;
var EXPRESSION_BULLET = /^([ \t]*)([*+-]|\d+[.)])( {1,4}(?! )| |\t)([^\n]*)/;
var EXPRESSION_PEDANTIC_BULLET = /^([ \t]*)([*+-]|\d+[.)])([ \t]+)/;
var EXPRESSION_INITIAL_INDENT = /^( {1,4}|\t)?/gm;
var EXPRESSION_INITIAL_TAB = /^( {4}|\t)?/gm;
var EXPRESSION_HTML_LINK_OPEN = /^<a /i;
var EXPRESSION_HTML_LINK_CLOSE = /^<\/a>/i;
var EXPRESSION_LOOSE_LIST_ITEM = /\n\n(?!\s*$)/;
var EXPRESSION_TASK_ITEM = /^\[([\ \t]|x|X)\][\ \t]/;

/*
 * A map of characters, and their column length,
 * which can be used as indentation
 */

var INDENTATION_CHARACTERS = objectCreate();

INDENTATION_CHARACTERS[SPACE] = SPACE.length;
INDENTATION_CHARACTERS[TAB] = TAB_SIZE;

/**
 * Gets column-size of the indentation.
 *
 * @param {string} value
 * @return {Object}
 */
function getIndent(value) {
    var index = 0;
    var indent = 0;
    var character = value.charAt(index);
    var stops = {};
    var size;

    while (character in INDENTATION_CHARACTERS) {
        size = INDENTATION_CHARACTERS[character];

        indent += size;

        if (size > 1) {
            indent = Math.floor(indent / size) * size;
        }

        stops[indent] = index;

        character = value.charAt(++index);
    }

    return {
        'indent': indent,
        'stops': stops
    };
}

/**
 * Remove the minimum indent from `value`.
 *
 * @param {string} value
 * @param {number?} maximum - The maximum indentation
 *   to remove.
 * @return {string}
 */
function removeIndentation(value, maximum) {
    var values = value.split(NEW_LINE);
    var position = values.length + 1;
    var minIndent = Infinity;
    var matrix = [];
    var index;
    var indentation;
    var stops;
    var padding;

    values.unshift(repeat(SPACE, maximum) + EXCLAMATION_MARK);

    while (position--) {
        indentation = getIndent(values[position]);

        matrix[position] = indentation.stops;

        if (trim(values[position]).length === 0) {
            continue;
        }

        if (indentation.indent) {
            if (indentation.indent > 0 && indentation.indent < minIndent) {
                minIndent = indentation.indent;
            }
        } else {
            minIndent = Infinity;

            break;
        }
    }

    if (minIndent !== Infinity) {
        position = values.length;

        while (position--) {
            stops = matrix[position];
            index = minIndent;

            while (index && !(index in stops)) {
                index--;
            }

            if (
                trim(values[position]).length !== 0 &&
                minIndent &&
                index !== minIndent
            ) {
                padding = TAB;
            } else {
                padding = EMPTY;
            }

            values[position] = padding + values[position].slice(
                index in stops ? stops[index] + 1 : 0
            );
        }
    }

    values.shift();

    return values.join(NEW_LINE);
}

/**
 * Ensure that `value` is at least indented with
 * `indent` spaces.
 *
 * @param {string} value
 * @param {number} indent - The maximum amount of
 *   spacing to insert.
 * @return {string}
 */
function ensureIndentation(value, indent) {
    var values = value.split(NEW_LINE);
    var length = values.length;
    var index = -1;
    var line;
    var position;

    while (++index < length) {
        line = values[index];

        position = -1;

        while (++position < indent) {
            if (line.charAt(position) !== SPACE) {
                values[index] = repeat(SPACE, indent - position) + line;
                break;
            }
        }
    }

    return values.join(NEW_LINE);
}

/**
 * Get the alignment from a table rule.
 *
 * @param {Array.<Array.<Object>>} rows
 * @return {Array.<string>}
 */
function getAlignment(rows) {
    var results = [];
    var index = -1;
    var length = rows.length;
    var alignment;

    while (++index < length) {
        alignment = rows[index];

        if (EXPRESSION_RIGHT_ALIGNMENT.test(alignment)) {
            results[index] = 'right';
        } else if (EXPRESSION_CENTER_ALIGNMENT.test(alignment)) {
            results[index] = 'center';
        } else if (EXPRESSION_LEFT_ALIGNMENT.test(alignment)) {
            results[index] = 'left';
        } else {
            results[index] = null;
        }
    }

    return results;
}

/**
 * Construct a state toggler.
 *
 * @param {string} property - Thing th toggle
 * @param {boolean} state - It's default state.
 * @return {Function} - Toggler.
 */
function stateToggler(property, state) {
    /**
     * Construct a toggler for the bound property.
     *
     * @return {Function} - Callback to cancel the state.
     */
    function toggler() {
        var self = this;
        var current = self[property];

        self[property] = !state;

        /**
         * State cancler, cancels the state if allowed.
         */
        return function () {
            self[property] = current;
        };
    }

    return toggler;
}

/**
 * Construct a state toggler which doesn't toggle.
 *
 * @return {Function} - Toggler.
 */
function noopToggler() {
    /**
     * No-operation.
     */
    function noop() {}

    /**
     * @return {Function}
     */
    function toggler() {
        return noop;
    }

    return toggler;
}

/*
 * Define nodes of a type which can be merged.
 */

var MERGEABLE_NODES = objectCreate();

/**
 * Merge two text nodes: `token` into `prev`.
 *
 * @param {Object} prev
 * @param {Object} token
 * @return {Object} `prev`.
 */
MERGEABLE_NODES.text = function (prev, token) {
    prev.value += token.value;

    return prev;
};

/**
 * Merge two blockquotes: `token` into `prev`.
 *
 * @param {Object} prev
 * @param {Object} token
 * @return {Object} `prev`.
 */
MERGEABLE_NODES.blockquote = function (prev, token) {
    if (this.options.commonmark) {
        return token;
    }

    prev.children = prev.children.concat(token.children);

    return prev;
};

/**
 * Merge two lists: `token` into `prev`.
 *
 * @param {Object} prev
 * @param {Object} token
 * @return {Object} `prev`.
 */
MERGEABLE_NODES.list = function (prev, token) {
    if (
        !this.currentBullet ||
        this.currentBullet !== this.previousBullet ||
        this.currentBullet.length !== 1
    ) {
        return token;
    }

    prev.children = prev.children.concat(token.children);

    return prev;
};

/**
 * Tokenise a line.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Lines.
 */
function tokenizeNewline(eat, $0) {
    if ($0.length > 1) {
        this.currentBullet = null;
        this.previousBullet = null;
    }

    eat($0);
}

/**
 * Tokenise a code block.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole code.
 * @return {Node}
 */
function tokenizeCode(eat, $0) {
    $0 = trimRightLines($0);

    return eat($0)(this.renderCodeBlock(
        removeIndentation($0, TAB_SIZE), null, eat)
    );
}

/**
 * Tokenise a fenced code block.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole code.
 * @param {string} $1 - Initial spacing.
 * @param {string} $2 - Initial fence.
 * @param {string} $3 - Fence marker.
 * @param {string} $4 - Programming language flag.
 * @param {string} $5 - Content.
 * @return {Node}
 */
function tokenizeFences(eat, $0, $1, $2, $3, $4, $5) {
    $0 = trimRightLines($0);

    /*
     * If the initial fence was preceded by spaces,
     * exdent that amount of white space from the code
     * block.  Because it's possible that the code block
     * is exdented, we first have to ensure at least
     * those spaces are available.
     */

    if ($1) {
        $5 = removeIndentation(ensureIndentation($5, $1.length), $1.length);
    }

    return eat($0)(this.renderCodeBlock($5, $4, eat));
}

/**
 * Tokenise an ATX-style heading.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole heading.
 * @param {string} $1 - Initial spacing.
 * @param {string} $2 - Hashes.
 * @param {string} $3 - Internal spacing.
 * @param {string} $4 - Content.
 * @return {Node}
 */
function tokenizeHeading(eat, $0, $1, $2, $3, $4) {
    var offset = this.offset;
    var now = eat.now();
    var line = now.line;
    var prefix = $1 + $2 + $3;

    offset[line] = (offset[line] || 0) + prefix.length;

    return eat($0)(this.renderHeading($4, $2.length, now));
}

/**
 * Tokenise a Setext-style heading.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole heading.
 * @param {string} $1 - Initial spacing.
 * @param {string} $2 - Content.
 * @param {string} $3 - Underline marker.
 * @return {Node}
 */
function tokenizeLineHeading(eat, $0, $1, $2, $3) {
    var now;

    eat($1);

    now = eat.now();

    return eat($0)(this.renderHeading($2, $3 === EQUALS ? 1 : 2, now));
}

/**
 * Tokenise a horizontal rule.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole rule.
 * @return {Node}
 */
function tokenizeHorizontalRule(eat, $0) {
    return eat($0)(this.renderVoid(HORIZONTAL_RULE));
}

/**
 * Tokenise a blockquote.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole blockquote.
 * @return {Node}
 */
function tokenizeBlockquote(eat, $0) {
    var now = eat.now();

    $0 = trimRightLines($0);

    return eat($0)(this.renderBlockquote($0, now));
}

/**
 * Tokenise a list.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole list.
 * @param {string} $1 - Indent.
 * @param {string} $2 - Bullet.
 * @return {Node}
 */
function tokenizeList(eat, $0, $1, $2) {
    var self = this;
    var firstBullet = $2;
    var matches = trimRightLines($0).match(self.rules.item);
    var length = matches.length;
    var index = 0;
    var isLoose = false;
    var now;
    var bullet;
    var add;
    var item;
    var enterTop;
    var exitBlockquote;
    var node;
    var indent;
    var size;
    var position;
    var end;

    /*
     * Determine if all list-items belong to the
     * same list.
     */

    if (!self.options.pedantic) {
        while (++index < length) {
            bullet = self.rules.bullet.exec(matches[index])[0];

            if (
                firstBullet !== bullet &&
                (
                    firstBullet.length === 1 && bullet.length === 1 ||
                    bullet.charAt(bullet.length - 1) !==
                    firstBullet.charAt(firstBullet.length - 1)
                )
            ) {
                matches = matches.slice(0, index);
                matches[index - 1] = trimRightLines(matches[index - 1]);
                length = matches.length;

                break;
            }
        }
    }

    if (self.options.commonmark) {
        index = -1;

        while (++index < length) {
            item = matches[index];
            indent = self.rules.indent.exec(item);
            indent = indent[1] + repeat(SPACE, indent[2].length) + indent[3];
            size = getIndent(indent).indent;
            position = indent.length;
            end = item.length;

            while (++position < end) {
                if (
                    item.charAt(position) === NEW_LINE &&
                    item.charAt(position - 1) === NEW_LINE &&
                    getIndent(item.slice(position + 1)).indent < size
                ) {
                    matches[index] = item.slice(0, position - 1);

                    matches = matches.slice(0, index + 1);
                    length = matches.length;

                    break;
                }
            }
        }
    }

    self.previousBullet = self.currentBullet;
    self.currentBullet = firstBullet;

    index = -1;

    add = eat(EMPTY);

    enterTop = self.exitTop();
    exitBlockquote = self.enterBlockquote();

    node = add(self.renderList([], firstBullet));

    while (++index < length) {
        item = matches[index];
        now = eat.now();

        item = eat(item)(node, self.renderListItem(item, now));

        if (item.loose) {
            isLoose = true;
        }

        if (index !== length - 1) {
            eat(NEW_LINE);
        }
    }

    node.loose = isLoose;

    node.position.end = eat.now();

    enterTop();
    exitBlockquote();

    return node;
}

/**
 * Tokenise HTML.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole HTML.
 * @return {Node}
 */
function tokenizeHtml(eat, $0) {
    $0 = trimRightLines($0);

    return eat($0)(this.renderRaw(HTML, $0));
}

/**
 * Tokenise a definition.
 *
 * @property {boolean} onlyAtTop
 * @property {boolean} notInBlockquote
 * @param {function(string)} eat
 * @param {string} $0 - Whole definition.
 * @param {string} $1 - Key.
 * @param {string} $2 - URL.
 * @param {string} $3 - Title.
 * @return {Node}
 */
function tokenizeDefinition(eat, $0, $1, $2, $3) {
    var link = $2;

    /*
     * Remove angle-brackets from `link`.
     */

    if (link.charAt(0) === LT && link.charAt(link.length - 1) === GT) {
        link = link.slice(1, -1);
    }

    return eat($0)({
        'type': 'definition',
        'identifier': normalize($1),
        'title': $3 || null,
        'link': this.descape(link)
    });
}

tokenizeDefinition.onlyAtTop = true;
tokenizeDefinition.notInBlockquote = true;

/**
 * Tokenise YAML front matter.
 *
 * @property {boolean} onlyAtStart
 * @param {function(string)} eat
 * @param {string} $0 - Whole front matter.
 * @param {string} $1 - Content.
 * @return {Node}
 */
function tokenizeYAMLFrontMatter(eat, $0, $1) {
    return eat($0)(this.renderRaw(YAML, $1 ? trimRightLines($1) : EMPTY));
}

tokenizeYAMLFrontMatter.onlyAtStart = true;

/**
 * Tokenise a footnote definition.
 *
 * @property {boolean} onlyAtTop
 * @property {boolean} notInBlockquote
 * @param {function(string)} eat
 * @param {string} $0 - Whole definition.
 * @param {string} $1 - Whole key.
 * @param {string} $2 - Key.
 * @param {string} $3 - Whole value.
 * @return {Node}
 */
function tokenizeFootnoteDefinition(eat, $0, $1, $2, $3) {
    var self = this;
    var now = eat.now();
    var line = now.line;
    var offset = self.offset;

    $3 = $3.replace(EXPRESSION_INITIAL_TAB, function (value) {
        offset[line] = (offset[line] || 0) + value.length;
        line++;

        return EMPTY;
    });

    now.column += $1.length;

    return eat($0)(self.renderFootnoteDefinition(normalize($2), $3, now));
}

tokenizeFootnoteDefinition.onlyAtTop = true;
tokenizeFootnoteDefinition.notInBlockquote = true;

/**
 * Tokenise a table.
 *
 * @property {boolean} onlyAtTop
 * @param {function(string)} eat
 * @param {string} $0 - Whole table.
 * @param {string} $1 - Whole heading.
 * @param {string} $2 - Trimmed heading.
 * @param {string} $3 - Whole alignment.
 * @param {string} $4 - Trimmed alignment.
 * @param {string} $5 - Rows.
 * @return {Node}
 */
function tokenizeTable(eat, $0, $1, $2, $3, $4, $5) {
    var self = this;
    var now;
    var node;
    var index;
    var length;

    node = eat(EMPTY)({
        'type': TABLE,
        'align': [],
        'children': []
    });

    /**
     * Eat a fence.
     *
     * @param {string} value
     * @return {string} - Empty.
     */
    function eatFence(value) {
        eat(value);

        return EMPTY;
    }

    /**
     * Factory to eat a cell to a bound `row`.
     *
     * @param {Object} row
     * @return {Function}
     */
    function eatCellFactory(row) {
        /**
         * Eat a cell.
         *
         * @param {string} value
         * @param {string} content
         * @param {string} pipe
         * @return {string} - Empty.
         */
        function eatCell(value, content, pipe) {
            now = eat.now();

            eat(content)(row, self.renderBlock(
                TABLE_CELL, self.tokenizeInline(content.trim(), now)
            ));

            eat(pipe);

            return EMPTY;
        }

        return eatCell;
    }

    /**
     * Eat a row of type `type`.
     *
     * @param {string} type
     * @param {string} value
     */
    function renderRow(type, value) {
        var row = eat(EMPTY)(node, self.renderBlock(type, []));

        value
            .replace(EXPRESSION_TABLE_INITIAL, eatFence)
            .replace(EXPRESSION_TABLE_CONTENT, eatCellFactory(row));

        row.position.end = eat.now();
    }

    /*
     * Add the table's header.
     */

    renderRow(TABLE_HEADER, $1);

    eat(NEW_LINE);

    /*
     * Add the table's alignment.
     */

    eat($3);

    $4 = $4
        .replace(EXPRESSION_TABLE_FENCE, EMPTY)
        .split(EXPRESSION_TABLE_BORDER);

    node.align = getAlignment($4);

    /*
     * Add the table rows to table's children.
     */

    $5 = trimRightLines($5).split(NEW_LINE);

    index = -1;
    length = $5.length;

    while (++index < length) {
        renderRow(TABLE_ROW, $5[index]);

        if (index !== length - 1) {
            eat(NEW_LINE);
        }
    }

    node.position.end = eat.now();

    return node;
}

tokenizeTable.onlyAtTop = true;

/**
 * Tokenise a paragraph token.
 *
 * @param {function(string)} eat
 * @param {string} $0
 * @return {Node?}
 */
function tokenizeParagraph(eat, $0) {
    var now = eat.now();

    if (trim($0) === EMPTY) {
        eat($0);

        return null;
    }

    $0 = trimRightLines($0);

    return eat($0)(this.renderBlock(PARAGRAPH, this.tokenizeInline($0, now)));
}

/**
 * Tokenise a text token.
 *
 * @param {function(string)} eat
 * @param {string} $0
 * @return {Node}
 */
function tokenizeText(eat, $0) {
    return eat($0)(this.renderRaw(TEXT, $0));
}

/**
 * Create a code-block token.
 *
 * @param {string?} value
 * @param {string?} language
 * @param {Function} eat
 * @return {Object}
 */
function renderCodeBlock(value, language, eat) {
    var flag = null;

    if (language) {
        flag = decode(this.descape(language), eat);
    }

    return {
        'type': CODE,
        'lang': flag,
        'value': trimRightLines(value || EMPTY)
    };
}

/**
 * Create a list token.
 *
 * @param {string} children
 * @param {string} bullet
 * @return {Object}
 */
function renderList(children, bullet) {
    var start = parseInt(bullet, 10);

    if (start !== start) {
        start = null;
    }

    /*
     * `loose` should be added later.
     */

    return {
        'type': LIST,
        'ordered': bullet.length > 1,
        'start': start,
        'loose': null,
        'children': children
    };
}

/**
 * Create a list-item using lacks behaviour.
 *
 * @param {string} token
 * @param {Object} position
 * @return {Object}
 */
function renderPedanticListItem(token, position) {
    var self = this;
    var offset = self.offset;
    var line = position.line;

    /**
     * A simple replacer which removed all matches,
     * and adds their length to `offset`.
     *
     * @param {string} $0
     * @return {string}
     */
    function replacer($0) {
        offset[line] = (offset[line] || 0) + $0.length;
        line++;

        return EMPTY;
    }

    /*
     * Remove the list token's bullet.
     */

    token = token.replace(EXPRESSION_PEDANTIC_BULLET, replacer);

    /*
     * The initial line is also matched by the below, so
     * we reset the `line`.
     */

    line = position.line;

    return token.replace(EXPRESSION_INITIAL_INDENT, replacer);
}

/**
 * Create a list-item using sane behaviour.
 *
 * @param {string} token
 * @param {Object} position
 * @return {Object}
 */
function renderNormalListItem(token, position) {
    var self = this;
    var offset = self.offset;
    var line = position.line;
    var bullet;
    var rest;
    var lines;
    var trimmedLines;
    var index;
    var length;
    var max;

    /*
     * Remove the list token's bullet.
     */

    token = token.replace(EXPRESSION_BULLET, function ($0, $1, $2, $3, $4) {
        bullet = $1 + $2 + $3;
        rest = $4;

       /*
        * Make sure that the first nine numbered list items
        * can indent with an extra space.  That is, when
        * the bullet did not receive an extra final space.
        */

        if (Number($2) < 10 && bullet.length % 2 === 1) {
            $2 = SPACE + $2;
        }

        max = $1 + repeat(SPACE, $2.length) + $3;

        return max + rest;
    });

    lines = token.split(NEW_LINE);

    trimmedLines = removeIndentation(
        token, getIndent(max).indent
    ).split(NEW_LINE);

    /*
     * We replaced the initial bullet with something
     * else above, which was used to trick
     * `removeIndentation` into removing some more
     * characters when possible. However, that could
     * result in the initial line to be stripped more
     * than it should be.
     */

    trimmedLines[0] = rest;

    offset[line] = (offset[line] || 0) + bullet.length;
    line++;

    index = 0;
    length = lines.length;

    while (++index < length) {
        offset[line] = (offset[line] || 0) +
            lines[index].length - trimmedLines[index].length;

        line++;
    }

    return trimmedLines.join(NEW_LINE);
}

/*
 * A map of two functions which can create list items.
 */

var LIST_ITEM_MAP = objectCreate();

LIST_ITEM_MAP.true = renderPedanticListItem;
LIST_ITEM_MAP.false = renderNormalListItem;

/**
 * Create a list-item token.
 *
 * @param {Object} token
 * @return {Object} position
 * @return {Object}
 */
function renderListItem(token, position) {
    var self = this;
    var offsets = self.offset;
    var checked = null;
    var node;
    var task;
    var offset;

    token = LIST_ITEM_MAP[self.options.pedantic].apply(self, arguments);

    if (self.options.gfm) {
        task = token.match(EXPRESSION_TASK_ITEM);

        if (task) {
            checked = task[1].toLowerCase() === 'x';

            offset = task[0].length;
            offsets[position.line] += offset;
            token = token.slice(offset);
        }
    }

    node = {
        'type': LIST_ITEM,
        'loose': EXPRESSION_LOOSE_LIST_ITEM.test(token) ||
            token.charAt(token.length - 1) === NEW_LINE
    };

    if (self.options.gfm) {
        node.checked = checked;
    }

    node.children = self.tokenizeBlock(token, position);

    return node;
}

/**
 * Create a footnote-definition token.
 *
 * @param {string} identifier
 * @param {string} value
 * @param {Object} position
 * @return {Object}
 */
function renderFootnoteDefinition(identifier, value, position) {
    var self = this;
    var exitBlockquote = self.enterBlockquote();
    var token;

    token = {
        'type': FOOTNOTE_DEFINITION,
        'identifier': identifier,
        'children': self.tokenizeBlock(value, position)
    };

    exitBlockquote();

    return token;
}

/**
 * Create a heading token.
 *
 * @param {string} value
 * @param {number} depth
 * @param {Object} now
 * @return {Object}
 */
function renderHeading(value, depth, now) {
    return {
        'type': HEADING,
        'depth': depth,
        'children': this.tokenizeInline(value, now)
    };
}

/**
 * Create a blockquote token.
 *
 * @param {string} value
 * @param {Object} position
 * @return {Object}
 */
function renderBlockquote(value, position) {
    var self = this;
    var line = position.line;
    var offset = self.offset;
    var exitBlockquote = self.enterBlockquote();
    var token;

    value = value.replace(EXPRESSION_BLOCK_QUOTE, function ($0) {
        offset[line] = (offset[line] || 0) + $0.length;
        line++;

        return EMPTY;
    });

    token = {
        'type': BLOCKQUOTE,
        'children': this.tokenizeBlock(value, position)
    };

    exitBlockquote();

    return token;
}

/**
 * Create a void token.
 *
 * @param {string} type
 * @return {Object}
 */
function renderVoid(type) {
    return {
        'type': type
    };
}

/**
 * Create a children token.
 *
 * @param {string} type
 * @param {string|Array.<Object>} children
 * @return {Object}
 */
function renderBlock(type, children) {
    return {
        'type': type,
        'children': children
    };
}

/**
 * Create a raw token.
 *
 * @param {string} type
 * @param {string} value
 * @return {Object}
 */
function renderRaw(type, value) {
    return {
        'type': type,
        'value': value
    };
}

/**
 * Create a link token.
 *
 * @param {boolean} isLink - Whether page or image.
 * @param {string} href
 * @param {string} text
 * @param {string?} title
 * @param {Object} position
 * @param {function(string)} eat
 * @return {Object}
 */
function renderLink(isLink, href, text, title, position, eat) {
    var self = this;
    var exitLink = self.enterLink();
    var token;

    token = {
        'type': isLink ? LINK : IMAGE,
        'title': title ? decode(self.descape(title), eat) : null
    };

    href = decode(href, eat);

    if (isLink) {
        token.href = href;
        token.children = self.tokenizeInline(text, position);
    } else {
        token.src = href;
        token.alt = text ? decode(self.descape(text), eat) : null;
    }

    exitLink();

    return token;
}

/**
 * Create a footnote token.
 *
 * @param {string} value
 * @param {Object} position
 * @return {Object}
 */
function renderFootnote(value, position) {
    return {
        'type': FOOTNOTE,
        'children': this.tokenizeInline(value, position)
    };
}

/**
 * Add a token with inline content.
 *
 * @param {string} type
 * @param {string} value
 * @param {Object} position
 * @return {Object}
 */
function renderInline(type, value, position) {
    return {
        'type': type,
        'children': this.tokenizeInline(value, position)
    };
}

/**
 * Tokenise an escaped sequence.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole escape.
 * @param {string} $1 - Escaped character.
 * @return {Node}
 */
function tokenizeEscape(eat, $0, $1) {
    return eat($0)(this.renderRaw(ESCAPE, $1));
}

/**
 * Tokenise a URL in carets.
 *
 * @property {boolean} notInLink
 * @param {function(string)} eat
 * @param {string} $0 - Whole link.
 * @param {string} $1 - URL.
 * @param {string?} $2 - Protocol or at.
 * @return {Node}
 */
function tokenizeAutoLink(eat, $0, $1, $2) {
    var self = this;
    var href = $1;
    var text = $1;
    var now = eat.now();
    var offset = 1;
    var tokenize;
    var node;

    if ($2 === AT_SIGN) {
        if (
            text.substr(0, MAILTO_PROTOCOL.length).toLowerCase() !==
            MAILTO_PROTOCOL
        ) {
            href = MAILTO_PROTOCOL + text;
        } else {
            text = text.substr(MAILTO_PROTOCOL.length);
            offset += MAILTO_PROTOCOL.length;
        }
    }

    now.column += offset;

    /*
     * Temporarily remove support for escapes in autlinks.
     */

    tokenize = self.inlineTokenizers.escape;
    self.inlineTokenizers.escape = null;

    node = eat($0)(self.renderLink(true, href, text, null, now, eat));

    self.inlineTokenizers.escape = tokenize;

    return node;
}

tokenizeAutoLink.notInLink = true;

/**
 * Tokenise a URL in text.
 *
 * @property {boolean} notInLink
 * @param {function(string)} eat
 * @param {string} $0 - Whole link.
 * @param {string} $1 - URL.
 * @return {Node}
 */
function tokenizeURL(eat, $0, $1) {
    var now = eat.now();

    return eat($0)(this.renderLink(true, $1, $1, null, now, eat));
}

tokenizeURL.notInLink = true;

/**
 * Tokenise HTML.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Content.
 * @return {Node}
 */
function tokenizeTag(eat, $0) {
    var self = this;

    if (!self.inLink && EXPRESSION_HTML_LINK_OPEN.test($0)) {
        self.inLink = true;
    } else if (self.inLink && EXPRESSION_HTML_LINK_CLOSE.test($0)) {
        self.inLink = false;
    }

    return eat($0)(self.renderRaw(HTML, $0));
}

/**
 * Tokenise a link.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole link.
 * @param {string} $1 - Prefix.
 * @param {string} $2 - Text.
 * @param {string?} $3 - URL wrapped in angle braces.
 * @param {string?} $4 - Literal URL.
 * @param {string?} $5 - Title wrapped in single or double quotes.
 * @param {string?} $6 - Title wrapped in double quotes.
 * @param {string?} $7 - Title wrapped in parentheses.
 * @return {Node?}
 */
function tokenizeLink(eat, $0, $1, $2, $3, $4, $5, $6, $7) {
    var isLink = $0.charAt(0) !== EXCLAMATION_MARK;
    var href = $4 || $3 || '';
    var title = $7 || $6 || $5;
    var now;

    if (!isLink || !this.inLink) {
        now = eat.now();

        now.column += $1.length;

        return eat($0)(this.renderLink(
            isLink, this.descape(href), $2, title, now, eat
        ));
    }

    return null;
}

/**
 * Tokenise a reference link, image, or footnote;
 * shortcut reference link, or footnote.
 *
 * @property {boolean} notInLink
 * @param {function(string)} eat
 * @param {string} $0 - Whole link.
 * @param {string} $1 - Prefix.
 * @param {string} $2 - identifier.
 * @param {string} $3 - Content.
 * @return {Node}
 */
function tokenizeReference(eat, $0, $1, $2, $3) {
    var self = this;
    var text = $2;
    var identifier = $3 || $2;
    var type = $1 === BRACKET_OPEN ? 'link' : 'image';
    var isFootnote = self.options.footnotes && identifier.charAt(0) === CARET;
    var now = eat.now();
    var referenceType;
    var node;
    var exitLink;

    if ($3 === undefined) {
        referenceType = 'shortcut';
    } else if ($3 === '') {
        referenceType = 'collapsed';
    } else {
        referenceType = 'full';
    }

    if (referenceType !== 'shortcut') {
        isFootnote = false;
    }

    if (isFootnote) {
        identifier = identifier.substr(1);
    }

    if (isFootnote) {
        if (identifier.indexOf(SPACE) !== -1) {
            return eat($0)(self.renderFootnote(identifier, eat.now()));
        } else {
            type = 'footnote';
        }
    }

    now.column += $1.length;

    node = {
        'type': type + 'Reference',
        'identifier': normalize(identifier)
    };

    if (type === 'link' || type === 'image') {
        node.referenceType = referenceType;
    }

    if (type === 'link') {
        exitLink = self.enterLink();
        node.children = self.tokenizeInline(text, now);
        exitLink();
    } else if (type === 'image') {
        node.alt = decode(self.descape(text), eat);
    }

    return eat($0)(node);
}

tokenizeReference.notInLink = true;

/**
 * Tokenise strong emphasis.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole emphasis.
 * @param {string?} $1 - Marker.
 * @param {string?} $2 - Content.
 * @param {string?} $3 - Marker.
 * @param {string?} $4 - Content.
 * @return {Node?}
 */
function tokenizeStrong(eat, $0, $1, $2, $3, $4) {
    var now = eat.now();
    var value = $2 || $4;

    if (trim(value) === EMPTY) {
        return null;
    }

    now.column += 2;

    return eat($0)(this.renderInline(STRONG, value, now));
}

/**
 * Tokenise slight emphasis.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole emphasis.
 * @param {string?} $1 - Marker.
 * @param {string?} $2 - Content.
 * @param {string?} $3 - Marker.
 * @param {string?} $4 - Content.
 * @return {Node?}
 */
function tokenizeEmphasis(eat, $0, $1, $2, $3, $4) {
    var now = eat.now();
    var marker = $1 || $3;
    var value = $2 || $4;

    if (
        trim(value) === EMPTY ||
        value.charAt(0) === marker ||
        value.charAt(value.length - 1) === marker
    ) {
        return null;
    }

    now.column += 1;

    return eat($0)(this.renderInline(EMPHASIS, value, now));
}

/**
 * Tokenise a deletion.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole deletion.
 * @param {string} $1 - Content.
 * @return {Node}
 */
function tokenizeDeletion(eat, $0, $1) {
    var now = eat.now();

    now.column += 2;

    return eat($0)(this.renderInline(DELETE, $1, now));
}

/**
 * Tokenise inline code.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole code.
 * @param {string} $1 - Initial markers.
 * @param {string} $2 - Content.
 * @return {Node}
 */
function tokenizeInlineCode(eat, $0, $1, $2) {
    return eat($0)(this.renderRaw(INLINE_CODE, trim($2 || '')));
}

/**
 * Tokenise a break.
 *
 * @param {function(string)} eat
 * @param {string} $0
 * @return {Node}
 */
function tokenizeBreak(eat, $0) {
    return eat($0)(this.renderVoid(BREAK));
}

/**
 * Construct a new parser.
 *
 * @param {Object?} options
 * @constructor Parser
 */
function Parser(options) {
    var self = this;
    var rules = copy({}, self.expressions.rules);

    self.inLink = false;
    self.atTop = true;
    self.atStart = true;
    self.inBlockquote = false;

    self.rules = rules;
    self.descape = descapeFactory(rules, 'escape');

    self.options = clone(self.options);

    self.setOptions(options);
}

/**
 * Set options.
 *
 * @this {Parser}
 * @param {Object?} options
 * @return {Parser} - `self`.
 */
Parser.prototype.setOptions = function (options) {
    var self = this;
    var expressions = self.expressions;
    var rules = self.rules;
    var current = self.options;
    var key;

    if (options === null || options === undefined) {
        options = {};
    } else if (typeof options === 'object') {
        options = clone(options);
    } else {
        raise(options, 'options');
    }

    self.options = options;

    for (key in defaultOptions) {
        validate.boolean(options, key, current[key]);

        if (options[key]) {
            copy(rules, expressions[key]);
        }
    }

    if (options.gfm && options.breaks) {
        copy(rules, expressions.breaksGFM);
    }

    if (options.gfm && options.commonmark) {
        copy(rules, expressions.commonmarkGFM);
    }

    if (options.commonmark) {
        self.enterBlockquote = noopToggler();
    }

    return self;
};

/*
 * Expose `defaults`.
 */

Parser.prototype.options = defaultOptions;

/*
 * Expose `expressions`.
 */

Parser.prototype.expressions = defaultExpressions;

/**
 * Parse `value` into an AST.
 *
 * @param {Object} file
 * @return {Object}
 */
Parser.prototype.parse = function (file) {
    var self = this;
    var value = clean(String(file));
    var token;

    self.file = file;

    /*
     * Add an `offset` matrix, used to keep track of
     * syntax and white space indentation per line.
     */

    self.offset = {};

    token = self.renderBlock(ROOT, self.tokenizeBlock(value));

    token.position = {
        'start': {
            'line': 1,
            'column': 1
        }
    };

    token.position.end = self.eof || token.position.start;

    return token;
};

/*
 * Expose tokenizers for block-level nodes.
 */

Parser.prototype.blockTokenizers = {
    'yamlFrontMatter': tokenizeYAMLFrontMatter,
    'newline': tokenizeNewline,
    'code': tokenizeCode,
    'fences': tokenizeFences,
    'heading': tokenizeHeading,
    'lineHeading': tokenizeLineHeading,
    'horizontalRule': tokenizeHorizontalRule,
    'blockquote': tokenizeBlockquote,
    'list': tokenizeList,
    'html': tokenizeHtml,
    'definition': tokenizeDefinition,
    'footnoteDefinition': tokenizeFootnoteDefinition,
    'looseTable': tokenizeTable,
    'table': tokenizeTable,
    'paragraph': tokenizeParagraph
};

/*
 * Expose order in which to parse block-level nodes.
 */

Parser.prototype.blockMethods = [
    'yamlFrontMatter',
    'newline',
    'code',
    'fences',
    'blockquote',
    'heading',
    'horizontalRule',
    'list',
    'lineHeading',
    'html',
    'definition',
    'footnoteDefinition',
    'looseTable',
    'table',
    'paragraph',
    'blockText'
];

/**
 * Construct a tokenizer.
 *
 * @param {string} type
 * @return {function(string, Object?): Array.<Object>}
 */
function tokenizeFactory(type) {
    /**
     * Tokenizer for a bound `type`
     *
     * @param {string} value
     * @return {Array.<Object>}
     */
    function tokenize(value, location) {
        var self = this;
        var offset = self.offset;
        var tokens = [];
        var rules = self.rules;
        var methods = self[type + 'Methods'];
        var tokenizers = self[type + 'Tokenizers'];
        var line = location ? location.line : 1;
        var column = location ? location.column : 1;
        var add;
        var eat;
        var index;
        var length;
        var method;
        var name;
        var match;
        var matched;
        var valueLength;

        /*
         * Trim white space only lines.
         */

        if (!value) {
            return tokens;
        }

        /**
         * Update line and column based on `value`.
         *
         * @param {string} subvalue
         */
        function updatePosition(subvalue) {
            var lines = subvalue.match(/\n/g);
            var lastIndex = subvalue.lastIndexOf(NEW_LINE);

            if (lines) {
                line += lines.length;
            }

            if (lastIndex === -1) {
                column = column + subvalue.length;
            } else {
                column = subvalue.length - lastIndex;
            }

            if (line in offset) {
                if (lines) {
                    column += offset[line];
                } else if (column <= offset[line]) {
                    column = offset[line] + 1;
                }
            }
        }

        /**
         * Get the current position.
         *
         * @return {Object}
         */
        function now() {
            return {
                'line': line,
                'column': column
            };
        }

        /**
         * Store position information for a node.
         *
         * @param {Object} start
         */
        function Position(start) {
            this.start = start;
            this.end = now();
        }

        /**
         * Mark position and patch `node.position`.
         *
         * @returns {function(Node): Node}
         */
        function position() {
          var start = now();

          /**
           * Add the position to a node.
           *
           * @param {Node} node
           * @return {Node} - `node`.
           */
          function update(node) {
              start = node.position ? node.position.start : start;

              node.position = new Position(start);

              return node;
          }

          return update;
        }

        /**
         * Add `token` to `parent`, or `tokens`.
         *
         * @param {Object} parent
         * @param {Object?} token
         * @return {Object} The added or merged token.
         */
        add = function (parent, token) {
            var prev;
            var children;

            if (!token) {
                children = tokens;
                token = parent;
            } else {
                children = parent.children;
            }

            prev = children[children.length - 1];

            if (type === INLINE && token.type === TEXT) {
                token.value = decode(token.value, eat);
            }

            if (
                prev &&
                token.type === prev.type &&
                token.type in MERGEABLE_NODES
            ) {
                token = MERGEABLE_NODES[token.type].call(self, prev, token);
            }

            if (token !== prev) {
                children.push(token);
            }

            if (self.atStart && tokens.length) {
                self.exitStart();
            }

            return token;
        };

        /**
         * Remove `subvalue` from `value`.
         * Expects `subvalue` to be at the start from `value`,
         * and applies no validation.
         *
         * @param {string} subvalue
         * @return {Function} See add.
         */
        eat = function (subvalue) {
            var pos = position();

            value = value.substring(subvalue.length);

            updatePosition(subvalue);

            /**
             * Add the given arguments, and return the
             * node.
             *
             * @return {Node}
             */
            function apply() {
                return pos(add.apply(null, arguments));
            }

            return apply;
        };

        /*
         * Expose `now` on `eat`.
         */

        eat.now = now;

        /*
         * Expose `exception` on `eat`.
         */

        eat.file = self.file;

        /*
         * Sync initial offset.
         */

        updatePosition(EMPTY);

        /*
         * Iterate over `value`, and iterate over all
         * block-expressions.  When one matches, invoke
         * its companion function.  If no expression
         * matches, something failed (should not happen)
         * and an expression is thrown.
         */

        while (value) {
            index = -1;
            length = methods.length;
            matched = false;

            while (++index < length) {
                name = methods[index];

                method = tokenizers[name];

                match = rules[name] &&
                    method &&
                    (!method.onlyAtStart || self.atStart) &&
                    (!method.onlyAtTop || self.atTop) &&
                    (!method.notInBlockquote || !self.inBlockquote) &&
                    (!method.notInLink || !self.inLink) &&
                    rules[name].exec(value);

                if (match) {
                    valueLength = value.length;

                    method.apply(self, [eat].concat(match));

                    matched = valueLength !== value.length;

                    if (matched) {
                        break;
                    }
                }
            }

            /* istanbul ignore if */
            if (!matched) {
                self.file.fail('Infinite loop', eat.now());
            }
        }

        self.eof = now();

        return tokens;
    }

    return tokenize;
}

/**
 * Lex `value`.
 *
 * @param {string} value
 * @return {Array.<Object>}
 */

Parser.prototype.tokenizeBlock = tokenizeFactory(BLOCK);

/*
 * Expose helpers
 */

Parser.prototype.renderRaw = renderRaw;
Parser.prototype.renderVoid = renderVoid;
Parser.prototype.renderBlock = renderBlock;
Parser.prototype.renderInline = renderInline;

Parser.prototype.renderLink = renderLink;
Parser.prototype.renderCodeBlock = renderCodeBlock;
Parser.prototype.renderBlockquote = renderBlockquote;
Parser.prototype.renderList = renderList;
Parser.prototype.renderListItem = renderListItem;
Parser.prototype.renderFootnoteDefinition = renderFootnoteDefinition;
Parser.prototype.renderHeading = renderHeading;
Parser.prototype.renderFootnote = renderFootnote;

/*
 * Expose tokenizers for inline-level nodes.
 */

Parser.prototype.inlineTokenizers = {
    'escape': tokenizeEscape,
    'autoLink': tokenizeAutoLink,
    'url': tokenizeURL,
    'tag': tokenizeTag,
    'link': tokenizeLink,
    'reference': tokenizeReference,
    'shortcutReference': tokenizeReference,
    'strong': tokenizeStrong,
    'emphasis': tokenizeEmphasis,
    'deletion': tokenizeDeletion,
    'inlineCode': tokenizeInlineCode,
    'break': tokenizeBreak,
    'inlineText': tokenizeText
};

/*
 * Expose order in which to parse inline-level nodes.
 */

Parser.prototype.inlineMethods = [
    'escape',
    'autoLink',
    'url',
    'tag',
    'link',
    'reference',
    'shortcutReference',
    'strong',
    'emphasis',
    'deletion',
    'inlineCode',
    'break',
    'inlineText'
];

/**
 * Tokenise an inline value.
 *
 * @param {string} value
 * @return {Array.<Object>}
 */

Parser.prototype.tokenizeInline = tokenizeFactory(INLINE);

/*
 * Enter and exit helpers.
 */

Parser.prototype.enterLink = stateToggler('inLink', false);
Parser.prototype.exitTop = stateToggler('atTop', true);
Parser.prototype.exitStart = stateToggler('atStart', true);
Parser.prototype.enterBlockquote = stateToggler('inBlockquote', false);

/**
 * Transform a markdown document into an AST.
 *
 * @param {Object} file
 * @param {Object?} options
 * @return {Object}
 */
function parse(file, options) {
    var CustomParser = this.Parser || Parser;

    return new CustomParser(options).parse(file);
}

/*
 * Expose `Parser` on `parse`.
 */

parse.Parser = Parser;

/*
 * Expose `parse` on `module.exports`.
 */

module.exports = parse;
