'use strict';

/*
 * Dependencies.
 */

var he,
    utilities;

he = require('he');
utilities = require('./utilities.js');

/*
 * Cached methods.
 */

var copy,
    raise,
    trimRight,
    trimRightLines,
    clean,
    validate;

copy = utilities.copy;
raise = utilities.raise;
trimRight = utilities.trimRight;
trimRightLines = utilities.trimRightLines;
clean = utilities.clean;
validate = utilities.validate;

/*
 * Constants.
 */

var MAILTO_PROTOCOL,
    EQUALS,
    AT_SIGN,
    EXCLAMATION_MARK,
    SPACE,
    NEW_LINE,
    CARET,
    SLASH;

MAILTO_PROTOCOL = 'mailto:';
EQUALS = '=';
AT_SIGN = '@';
EXCLAMATION_MARK = '!';
SPACE = ' ';
NEW_LINE = '\n';
SLASH = '\\';
CARET = '^';

/*
 * Expressions.
 */

var EXPRESSION_START,
    EXPRESSION_INITIAL_SPACES,
    EXPRESSION_RIGHT_ALIGNMENT,
    EXPRESSION_CENTER_ALIGNMENT,
    EXPRESSION_SPACES_ONLY_LINE,
    EXPRESSION_TABLE_FENCE,
    EXPRESSION_TABLE_INITIAL,
    EXPRESSION_TABLE_CONTENT,
    EXPRESSION_TABLE_BORDER,
    EXPRESSION_BLOCK_QUOTE,
    EXPRESSION_BULLET,
    EXPRESSION_INITIAL_INDENT,
    EXPRESSION_LOOSE_LIST_ITEM,
    EXPRESSION_INITIAL_TAB,
    EXPRESSION_HTML_LINK_OPEN,
    EXPRESSION_HTML_LINK_CLOSE,
    EXPRESSION_WHITE_SPACES;

EXPRESSION_START = /(^|[^\[])\^/g;
EXPRESSION_INITIAL_SPACES = /^ +/;
EXPRESSION_RIGHT_ALIGNMENT = /^ *-+: *$/;
EXPRESSION_CENTER_ALIGNMENT = /^ *:-+: *$/;
EXPRESSION_SPACES_ONLY_LINE = /^ +$/gm;
EXPRESSION_TABLE_FENCE = /^ *|\| *$/g;
EXPRESSION_TABLE_INITIAL = /^ *\| */g;
EXPRESSION_TABLE_CONTENT = /([\s\S]+?)( *\| *\n?|\n?$)/g;
EXPRESSION_TABLE_BORDER = / *\| */;
EXPRESSION_BLOCK_QUOTE = /^ *> ?/gm;
EXPRESSION_BULLET = /^ *([*+-]|\d+\.) +/;
EXPRESSION_INITIAL_INDENT = /^ {1,4}/gm;
EXPRESSION_INITIAL_TAB = /^( {4})?/gm;
EXPRESSION_HTML_LINK_OPEN = /^<a /i;
EXPRESSION_HTML_LINK_CLOSE = /^<\/a>/i;
EXPRESSION_WHITE_SPACES = /\s+/g;

/*
 * Use
 *   /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
 * for discount behaviour.
 */

EXPRESSION_LOOSE_LIST_ITEM = /\n\n(?!\s*$)/;

/**
 * Clean an expression.
 *
 * @param {RegExp|string} expression
 * @return {string}
 */
function cleanExpression(expression) {
    return (expression.source || expression).replace(EXPRESSION_START, '$1');
}

/**
 * Remove the minimum indent from `value`.
 *
 * @param {string} value
 * @return {string}
 */
function removeIndent(value) {
    var index,
        minIndent,
        indent,
        values,
        expression;

    values = value.split(NEW_LINE);

    index = values.length;

    minIndent = Infinity;

    while (index--) {
        if (values[index].length === 0) {
            continue;
        }

        indent = values[index].match(EXPRESSION_INITIAL_SPACES);

        if (indent) {
            indent = indent[0].length;

            if (indent > 0 && indent < minIndent) {
                minIndent = indent;
            }
        } else {
            minIndent = Infinity;
            break;
        }
    }

    if (minIndent !== Infinity) {
        expression = new RegExp('^ {1,' + minIndent + '}');
        index = values.length;

        while (index--) {
            values[index] = values[index].replace(expression, '');
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
    var results,
        index,
        length,
        alignment;

    results = [];
    index = -1;
    length = rows.length;

    while (++index < length) {
        alignment = rows[index];

        if (EXPRESSION_RIGHT_ALIGNMENT.test(alignment)) {
            results[index] = 'right';
        } else if (EXPRESSION_CENTER_ALIGNMENT.test(alignment)) {
            results[index] = 'center';
        } else {
            results[index] = 'left';
        }
    }

    return results;
}

/*
 * Block helpers.
 */

var block;

block = {};

block.newline = /^\n+/;

block.bullet = /(?:[*+-]|\d+\.)/;

block.code = /^( {4}[^\n]+\n*)+/;

block.horizontalRule = /^( *[-*_]){3,} *(?=\n|$)/;

block.heading = /^ *((#{1,6}) *)([^\n]+?) *#* *(?=\n|$)/;

block.lineHeading = /^([^\n]+)\n *(=|-){2,} *(?=\n|$)/;

block.linkDefinition =
    /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?=\n|$)/;

block.text = /^[^\n]+/;

block.item = new RegExp(
    '^( *)(' +
        cleanExpression(block.bullet) +
    ') [^\\n]*(?:\\n(?!\\1' +
        cleanExpression(block.bullet) +
    ' )[^\\n]*)*',
'gm');

block.list = new RegExp(
    '^' +
    '( *)' +
    '(' + cleanExpression(block.bullet) + ')' +
    '(' +
        '(?: [\\s\\S]+?)' +
        '(?:' +

            /*
             * Modified Horizontal rule:
             */

            '\\n+(?=\\1?(?:[-*_] *){3,}(?=\\n|$))' +
            '|' +

            /*
             * Modified Link Definition:
             */

            '\\n+(?=' + cleanExpression(block.linkDefinition) + ')' +
            '|' +

            '\\n{2,}(?! )(?!\\1' +
                cleanExpression(block.bullet) +
            ' )' +
            '|' +

            '\\s*$' +
        ')' +
    ')'
);

block.blockquote = new RegExp(
    '^( *>[^\\n]+(\\n(?!' +

    cleanExpression(block.linkDefinition) +

    ')[^\\n]+)*)+'
);

block.tag = (
    '(?!' +
        '(?:' +
            'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|' +
            'var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|' +
            'span|br|wbr|ins|del|img' +
        ')\\b' +
    ')' +
    '\\w+(?!:' +
        '/|[^\\w\\s@]*@' +
    ')\\b'
);

block.html = new RegExp(
    '^ *(?:' +

        /*
         * HTML comment.
         */

        cleanExpression('<!--[\\s\\S]*?-->') +
        ' *(?:\\n|\\s*$)|' +

        /*
         * Closed tag.
         */

        cleanExpression('<(' + block.tag + ')[\\s\\S]+?<\\/\\1>') +
        ' *(?:\\n{2,}|\\s*$)|' +

        /*
         * Closing tag.
         */

        cleanExpression(
            '<' + block.tag + '(?:"[^"]*"|\'[^\']*\'|[^\'">])*?>'
        ) +
        ' *' +
        '(?:\\n{2,}|\\s*$)' +
    ')'
);

block.paragraph = new RegExp(
    '^(?:(?:' +
        '[^\\n]+\\n?' +
        '(?!' +
            cleanExpression(block.horizontalRule) +
            '|' +
            cleanExpression(block.heading) +
            '|' +
            cleanExpression(block.lineHeading) +
            '|' +
            cleanExpression(block.blockquote) +
            '|' +
            cleanExpression('<' + block.tag) +
            '|' +
            cleanExpression(block.linkDefinition) +
        ')' +
    ')+)'
);

/*
 * GFM + Tables Block Grammar
 */

var gfmLooseTable,
    gfmTable;

gfmLooseTable =
    /^( *(\S.*\|.*))\n( *([-:]+ *\|[-| :]*)\n)((?:.*\|.*(?:\n|$))*)/;

gfmTable = /^( *\|(.+))\n( *\|( *[-:]+[-| :]*)\n)((?: *\|.*(?:\n|$))*)/;

/*
 * GFM Block Grammar
 */

var gfmCodeFences,
    gfmParagraph;

gfmCodeFences = /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]*?)\s*\1 *(?=\n|$)/;

gfmParagraph = new RegExp(
    block.paragraph.source.replace('(?!', '(?!' +
        cleanExpression(gfmCodeFences).replace('\\1', '\\2') +
        '|' +
        cleanExpression(block.list).replace('\\1', '\\3') +
        '|'
    )
);

/*
 * Footnote block grammar
 */

var footnoteDefinition;

footnoteDefinition = /^( *\[\^([^\]]+)\]: *)([^\n]+(\n+ +[^\n]+)*)/;

/*
 * YAML front matter.
 */

var yamlFrontMatter;

yamlFrontMatter = /^-{3}\n([\s\S]+?\n)?-{3}/;

/*
 * Inline-Level Grammar.
 */

var inline;

inline = {};

inline.escape = /^\\([\\`*{}\[\]()#+\-.!_>])/;

inline.autoLink = /^<([^ >]+(@|:\/)[^ >]+)>/;

inline.tag = /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/;

inline.invalidLink = /^(!?\[)((?:\[[^\]]*\]|[^\[\]])*)\]/;

inline.strong = /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/;

inline.emphasis = /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/;

inline.code = /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/;

inline.break = /^ {2,}\n(?!\s*$)/;

inline.text = /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/;

inline.inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;

inline.href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = new RegExp(
    '^(!?\\[)(' +
        cleanExpression(inline.inside) +
    ')\\]\\(' +
        cleanExpression(inline.href) +
    '\\)'
);

inline.referenceLink = new RegExp(
    '^(!?\\[)(' +
        cleanExpression(inline.inside) +
    ')\\]\\s*\\[([^\\]]*)\\]'
);

/*
 * Pedantic Inline Grammar.
 */

var pedanticStrong,
    pedanticEmphasis;

pedanticStrong =
    /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/;

pedanticEmphasis =
    /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/;

/*
 * GFM Inline Grammar
 */

var gfmEscape,
    gfmURL,
    gfmDeletion,
    gfmText;

gfmEscape = new RegExp(
    inline.escape.source.replace('])', '~|])')
);

gfmURL = /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/;

gfmDeletion = /^~~(?=\S)([\s\S]*?\S)~~/;

gfmText = new RegExp(
    inline.text.source
        .replace(']|', '~]|')
        .replace('|', '|https?://|')
);

/*
 * GFM + Line Breaks Inline Grammar
 */

var breaksBreak,
    breaksText,
    breaksGFMText;

breaksBreak = new RegExp(inline.break.source.replace('{2,}', '*'));
breaksText = new RegExp(inline.text.source.replace('{2,}', '*'));
breaksGFMText = new RegExp(gfmText.source.replace('{2,}', '*'));

/*
 * Define nodes of a type which can be merged.
 */

var MERGEABLE_NODES = {};

/**
 * Merge two HTML nodes: `token` into `prev`.
 *
 * @param {Object} prev
 * @param {Object} token
 * @return {Object} `prev`.
 */
MERGEABLE_NODES.html = function (prev, token) {
    prev.value += '\n\n' + token.value;

    return prev;
};

/**
 * Merge two text nodes: `token` into `prev`.
 *
 * @param {Object} prev
 * @param {Object} token
 * @return {Object} `prev`.
 */
MERGEABLE_NODES.text = function (prev, token, type) {
    prev.value += (type === 'block' ? '\n' : '') + token.value;

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
    eat($0);
}

/**
 * Tokenise a code block.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole code.
 */
function tokenizeCode(eat, $0) {
    $0 = trimRightLines($0);

    eat($0)(this.renderCodeBlock($0));
}

/**
 * Tokenise a fenced code block.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole code.
 * @param {string} $1 - Fence.
 * @param {string} $2 - Programming language flag.
 * @param {string} $3 - Content.
 */
function tokenizeFences(eat, $0, $1, $2, $3) {
    eat($0)(this.renderCodeBlock($3, $2));
}

/**
 * Tokenise an ATX-style heading.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole heading.
 * @param {string} $1 - Initial hashes and spacing.
 * @param {string} $2 - Hashes.
 * @param {string} $3 - Content.
 */
function tokenizeHeading(eat, $0, $1, $2, $3) {
    var offset,
        line;

    offset = this.offset;
    line = eat.now().line;

    offset[line] = (offset[line] || 0) + $1.length;

    eat($0)(this.renderHeading($3, $2.length));
}

/**
 * Tokenise a Setext-style heading.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole heading.
 * @param {string} $1 - Content.
 * @param {string} $2 - Underline.
 */
function tokenizeLineHeading(eat, $0, $1, $2) {
    eat($0)(this.renderHeading($1, $2 === EQUALS ? 1 : 2));
}

/**
 * Tokenise a horizontal rule.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole rule.
 */
function tokenizeHorizontalRule(eat, $0) {
    eat($0)(this.renderVoid('horizontalRule'));
}

/**
 * Tokenise a blockquote.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole blockquote.
 */
function tokenizeBlockquote(eat, $0) {
    var now;

    now = eat.now();

    eat($0)(this.renderBlockquote($0, now));
}

/**
 * Tokenise a list.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole list.
 * @param {string} $1 - Indent.
 * @param {string} $2 - Bullet.
 */
function tokenizeList(eat, $0, $1, $2) {
    var self,
        now,
        matches,
        firstBullet,
        bullet,
        index,
        length,
        add,
        item,
        enterTop,
        exitBlockquote,
        list;

    self = this;

    firstBullet = $2;

    /*
     * Remove indent.
     */

    $0 = trimRight($0);

    /*
     * Parse the list.
     */

    matches = $0.match(self.blockRules.item);

    length = matches.length;
    index = -1;

    /*
     * Determine if all list-items belong to the
     * same list.
     */

    if (!self.options.pedantic) {
        while (++index < length) {
            bullet = block.bullet.exec(matches[index])[0];

            if (
                firstBullet !== bullet &&
                !(
                    firstBullet.length > 1 &&
                    bullet.length > 1
                )
            ) {
                matches = matches.slice(0, index);
                length = matches.length;

                break;
            }
        }
    }

    index = -1;

    add = eat('');

    enterTop = self.exitTop();
    exitBlockquote = self.enterBlockquote();

    list = add(self.renderList([], firstBullet.length > 1));

    while (++index < length) {
        item = matches[index];
        now = eat.now();

        item = eat(item)(list, self.renderListItem(item, now));

        eat(NEW_LINE);
    }

    list.position.end.line = item.position.end.line;
    list.position.end.column = item.position.end.column;

    enterTop();
    exitBlockquote();
}

/**
 * Tokenise a link definition.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole HTML.
 */
function tokenizeHtml(eat, $0) {
    $0 = trimRightLines($0);

    eat($0)(this.renderRaw('html', $0));
}

/**
 * Tokenise a link definition.
 *
 * @property {boolean} onlyAtTop
 * @property {boolean} notInBlockquote
 * @param {function(string)} eat
 * @param {string} $0 - Whole definition.
 * @param {string} $1 - Key.
 * @param {string} $2 - URL.
 * @param {string} $3 - Title.
 */
function tokenizeLinkDefinition(eat, $0, $1, $2, $3) {
    this.links[$1.toLowerCase()] = eat($0)({}, this.renderLink(
        true, $2, null, $3
    ));
}

tokenizeLinkDefinition.onlyAtTop = true;
tokenizeLinkDefinition.notInBlockquote = true;

/**
 * Tokenise YAML front matter.
 *
 * @property {boolean} onlyAtStart
 * @param {function(string)} eat
 * @param {string} $0 - Whole front matter.
 * @param {string} $1 - Content.
 */
function tokenizeYAMLFrontMatter(eat, $0, $1) {
    eat($0)(this.renderRaw('yaml', $1 ? trimRightLines($1) : ''));
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
 */
function tokenizeFootnoteDefinition(eat, $0, $1, $2, $3) {
    var self,
        token,
        now,
        line,
        offset;

    self = this;

    now = eat.now();

    line = now.line;
    offset = self.offset;

    $3 = $3.replace(EXPRESSION_INITIAL_TAB, function (value) {
        offset[line] = (offset[line] || 0) + value.length;
        line++;

        return '';
    });

    now.column += $1.length;

    token = eat($0)({},
        self.renderFootnoteDefinition($2.toLowerCase(), $3, now
    ));

    self.footnotes[token.id] = token;
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
 */
function tokenizeTable(eat, $0, $1, $2, $3, $4, $5) {
    var self,
        table,
        index,
        length,
        queue;

    self = this;

    $0 = trimRightLines($0);
    $5 = trimRightLines($5);

    table = eat('')({
        'type': 'table',
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

        return '';
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
        return function (value, content, pipe, pos, input) {
            var lastIndex = content.length;

            /*
             * Support escaped pipes in table cells.
             */

            while (lastIndex--) {
                if (content.charAt(lastIndex) !== SLASH) {
                    break;
                }

                if (content.charAt(--lastIndex) !== SLASH) {
                    /*
                     * Escaped pipe, add it to normal
                     * content, or, queue it for the
                     * next cell.
                     */

                    if (pos + content.length + 1 === input.length) {
                        content += pipe;
                        pipe = '';

                        break;
                    } else {
                        queue = content + pipe;

                        return content + pipe;
                    }
                }
            }

            if (queue) {
                content = queue + content;
                queue = '';
            }

            eat(content)(row, self.renderBlock('tableCell', content));

            eat(pipe);

            return '';
        };
    }

    /**
     * Eat a row of type `type`.
     *
     * @param {string} type
     * @param {string} value
     */
    function renderRow(type, value) {
        var row;

        row = eat('')(table, self.renderBlock(type, []));

        value
            .replace(EXPRESSION_TABLE_INITIAL, eatFence)
            .replace(EXPRESSION_TABLE_CONTENT, eatCellFactory(row));

        row.position.end = eat.now();
    }

    /*
     * Add the table's header.
     */

    renderRow('tableHeader', $1);

    eat(NEW_LINE);

    /*
     * Add the table's alignment.
     */

    eat($3);

    $4 = $4
        .replace(EXPRESSION_TABLE_FENCE, '')
        .split(EXPRESSION_TABLE_BORDER);

    table.align = getAlignment($4);

    /*
     * Add the table rows to table's children.
     */

    $5 = $5.split(NEW_LINE);

    index = -1;
    length = $5.length;

    while (++index < length) {
        renderRow('tableRow', $5[index]);

        if (index !== length - 1) {
            eat(NEW_LINE);
        }
    }

    table.position.end = eat.now();
}

tokenizeTable.onlyAtTop = true;

/**
 * Tokenise a paragraph token.
 *
 * @property {boolean} onlyAtTop
 * @param {function(string)} eat
 * @param {string} $0
 */
function tokenizeParagraph(eat, $0) {
    $0 = trimRight($0);

    eat($0)(this.renderBlock('paragraph', $0));
}

tokenizeParagraph.onlyAtTop = true;

/**
 * Tokenise a text token.
 *
 * @param {function(string)} eat
 * @param {string} $0
 */
function tokenizeText(eat, $0) {
    eat($0)(this.renderRaw('text', $0));
}

/**
 * Create a code-block token.
 *
 * @param {string?} value
 * @param {string?} language
 * @return {Object}
 */
function renderCodeBlock(value, language) {
    return {
        'type': 'code',
        'lang': language || null,
        'value': trimRightLines(removeIndent(value || ''))
    };
}

/**
 * Create a list token.
 *
 * @param {string} children
 * @param {boolean} ordered
 * @return {Object}
 */
function renderList(children, ordered) {
    return {
        'type': 'list',
        'ordered': ordered,
        'children': children
    };
}

/**
 * Create a list-item token.
 *
 * @param {string} token
 * @return {Object}
 */
function renderListItem(token, position) {
    var space,
        expression,
        loose,
        offset,
        line;

    space = 0;

    offset = this.offset;
    line = position.line;

    /*
     * Remove the list token's bullet.
     */

    token = token.replace(EXPRESSION_BULLET, function ($0) {
        space = $0.length;

        offset[line] = (offset[line] || 0) + space;

        /*
         * Make sure that the first nine numbered list items
         * can indent with an extra space:
         */

        space = Math.ceil(space / 2) * 2;

        return '';
    });

    /*
     * Exdent whatever the list token contains.  Hacky.
     */

    if (this.options.pedantic) {
        expression = EXPRESSION_INITIAL_INDENT;
    } else {
        expression = new RegExp('^( {0,' + space + '})', 'gm');
    }

    token = token.replace(expression, function ($0) {
        offset[line] = (offset[line] || 0) + $0.length;
        line++;

        return '';
    });

    /*
     * Determine whether token is loose or not.
     */

    loose = EXPRESSION_LOOSE_LIST_ITEM.test(token) ||
        token.charAt(token.length - 1) === NEW_LINE;

    return {
        'type': 'listItem',
        'loose': loose,
        'children': this.tokenizeBlock(token, position)
    };
}

/**
 * Create a footnote-definition token.
 *
 * @param {string} id
 * @param {string} value
 * @return {Object}
 */
function renderFootnoteDefinition(id, value, position) {
    var self,
        token,
        exitBlockquote;

    self = this;

    exitBlockquote = self.enterBlockquote();

    token = {
        'type': 'footnoteDefinition',
        'id': id,
        'children': self.tokenizeBlock(value, position)
    };

    exitBlockquote();

    self.footnotesAsArray.push(id);

    return token;
}

/**
 * Create a heading token.
 *
 * @param {string} value
 * @param {number} depth
 * @return {Object}
 */
function renderHeading(value, depth) {
    return {
        'type': 'heading',
        'depth': depth,
        'children': value
    };
}

/**
 * Create a blockquote token.
 *
 * @param {string} value
 * @return {Object}
 */
function renderBlockquote(value, position) {
    var self,
        token,
        exitBlockquote,
        offset,
        line;

    self = this;

    line = position.line;
    offset = self.offset;

    exitBlockquote = self.enterBlockquote();

    value = value.replace(EXPRESSION_BLOCK_QUOTE, function ($0) {
        offset[line] = (offset[line] || 0) + $0.length;
        line++;

        return '';
    });

    token = {
        'type': 'blockquote',
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
 * @param {boolean} isLink - Whether page or image reference.
 * @param {string} href
 * @param {string} text
 * @param {string?} title
 * @return {Object}
 */
function renderLink(isLink, href, text, title, position) {
    var token,
        exitLink;

    token = {
        'type': isLink ? 'link' : 'image',
        'title': title || null
    };

    if (isLink) {
        exitLink = this.enterLink();

        token.href = href;
        token.children = this.tokenizeInline(text, position);

        exitLink();
    } else {
        token.src = href;
        token.alt = text || null;
    }

    return token;
}

/**
 * Create a footnote token.
 *
 * @param {string} id
 * @return {Object}
 */
function renderFootnote(id) {
    return {
        'type': 'footnote',
        'id': id
    };
}

/**
 * Add a token with inline content.
 *
 * @param {string} type
 * @param {string} value
 * @return {Object}
 */
function renderInline(type, value, location) {
    return {
        'type': type,
        'children': this.tokenizeInline(value, location)
    };
}

/**
 * Tokenise an escaped sequence.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole escape.
 * @param {string} $1 - Escaped character.
 */
function tokenizeEscape(eat, $0, $1) {
    eat($0)(this.renderRaw('escape', $1));
}

/**
 * Tokenise a URL in carets.
 *
 * @property {boolean} notInLink
 * @param {function(string)} eat
 * @param {string} $0 - Whole link.
 * @param {string} $1 - URL.
 * @param {string?} $2 - Protocol or at.
 */
function tokenizeAutoLink(eat, $0, $1, $2) {
    var href,
        text,
        now,
        offset;

    href = $1;
    text = $1;

    /*
     * `1` is for the length of an opening angle bracket.
     */

    offset = 1;

    if ($2 === AT_SIGN) {
        if (text.substr(0, MAILTO_PROTOCOL.length) !== MAILTO_PROTOCOL) {
            href = MAILTO_PROTOCOL + text;
        } else {
            text = text.substr(MAILTO_PROTOCOL.length);
            offset += MAILTO_PROTOCOL.length;
        }
    }

    now = eat.now();
    now.column += offset;

    eat($0)(this.renderLink(true, href, text, null, now));
}

tokenizeAutoLink.notInLink = true;

/**
 * Tokenise a URL in text.
 *
 * @property {boolean} notInLink
 * @param {function(string)} eat
 * @param {string} $0 - Whole link.
 * @param {string} $1 - URL.
 */
function tokenizeURL(eat, $0, $1) {
    var now;

    now = eat.now();

    eat($0)(this.renderLink(true, $1, $1, null, now));
}

tokenizeURL.notInLink = true;

/**
 * Tokenise HTML.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Content.
 */
function tokenizeTag(eat, $0) {
    var self;

    self = this;

    if (!self.inLink && EXPRESSION_HTML_LINK_OPEN.test($0)) {
        self.inLink = true;
    } else if (self.inLink && EXPRESSION_HTML_LINK_CLOSE.test($0)) {
        self.inLink = false;
    }

    eat($0)(self.renderRaw('html', $0));
}

/**
 * Tokenise a link.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole link.
 * @param {string} $1 - Content.
 * @param {string} $2 - URL.
 * @param {string?} $3 - Title.
 */
function tokenizeLink(eat, $0, $1, $2, $3, $4) {
    var isLink,
        now;

    isLink = $0.charAt(0) !== EXCLAMATION_MARK;

    if (!isLink || !this.inLink) {
        now = eat.now();

        now.column += $1.length;

        eat($0)(this.renderLink(isLink, $3, $2, $4, now));
    }
}

/**
 * Tokenise a reference link, invalid link, or inline
 * footnote, or reference footnote.
 *
 * @property {boolean} notInLink
 * @param {function(string)} eat
 * @param {string} $0 - Whole link.
 * @param {string} $1 - Prefix.
 * @param {string} $2 - URL.
 * @param {string} $3 - Content.
 */
function tokenizeReferenceLink(eat, $0, $1, $2, $3) {
    var self,
        text,
        url,
        token,
        now;

    self = this;

    text = ($3 || $2).replace(EXPRESSION_WHITE_SPACES, SPACE);
    url = self.links[text.toLowerCase()];

    if (
        self.options.footnotes &&
        text.charAt(0) === CARET &&
        self.footnotes[text.substr(1)]
    ) {
        /*
         * All block-level footnote-definitions
         * are already found.  If we find the
         * provided ID in the footnotes hash, its
         * most certainly a footnote.
         */

        eat($0)(self.renderFootnote(text.substr(1)));
    } else if (!url || !url.href) {
        if (
            self.options.footnotes &&
            text.charAt(0) === CARET &&
            text.indexOf(SPACE) > -1
        ) {
            /*
             * All user-defined footnote IDs are
             * already found.  Thus, we can safely
             * choose any not-yet-used number as
             * footnote IDs, without being afraid
             * these IDs will be defined later.
             */

            while (self.footnoteCounter in self.footnotes) {
                self.footnoteCounter++;
            }

            now = eat.now();

            /*
             * Add initial bracket plus caret.
             */

            now.column += $1.length + 1;

            token = self.renderFootnoteDefinition(
                String(self.footnoteCounter), text.substr(1), now
            );

            self.footnotes[token.id] = token;

            eat($0)(self.renderFootnote(token.id));
        } else {
            eat($0.charAt(0))(self.renderRaw('text', $0.charAt(0)));
        }
    } else {
        now = eat.now($1);

        now.column += $1.length;

        eat($0)(self.renderLink(
            $0.charAt(0) !== EXCLAMATION_MARK, url.href, $2, url.title, now
        ));
    }
}

tokenizeReferenceLink.notInLink = true;

/**
 * Tokenise strong emphasis.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole emphasis.
 * @param {string?} $1 - Content.
 * @param {string?} $2 - Content.
 */
function tokenizeStrong(eat, $0, $1, $2) {
    var now;

    now = eat.now();

    now.column += 2;

    eat($0)(this.renderInline('strong', $2 || $1, now));
}

/**
 * Tokenise slight emphasis.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole emphasis.
 * @param {string?} $1 - Content.
 * @param {string?} $2 - Content.
 */
function tokenizeEmphasis(eat, $0, $1, $2) {
    var now;

    now = eat.now();

    now.column += 1;

    eat($0)(this.renderInline('emphasis', $2 || $1, now));
}

/**
 * Tokenise a deletion.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole deletion.
 * @param {string} $1 - Content.
 */
function tokenizeDeletion(eat, $0, $1) {
    var now;

    now = eat.now();

    now.column += 2;

    eat($0)(this.renderInline('delete', $1, now));
}

/**
 * Tokenise inline code.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole code.
 * @param {string} $1 - Delimiter.
 * @param {string} $2 - Content.
 */
function tokenizeInlineCode(eat, $0, $1, $2) {
    eat($0)(this.renderRaw('inlineCode', trimRight($2)));
}

/**
 * Tokenise a break.
 *
 * @param {function(string)} eat
 * @param {string} $0
 */
function tokenizeBreak(eat, $0) {
    eat($0)(this.renderVoid('break'));
}

/**
 * Tokenise inline text.
 *
 * @param {function(string)} eat
 * @param {string} $0
 */
function tokenizeInlineText(eat, $0) {
    eat($0)(this.renderRaw('text', $0));
}

/**
 * Construct a new parser.
 *
 * @param {Object?} options
 * @constructor Parser
 */
function Parser(options) {
    var self,
        blockRules,
        inlineRules;

    self = this;

    /*
     * Create space for definition/reference type nodes.
     */

    self.links = {};
    self.footnotes = {};
    self.footnotesAsArray = [];

    self.options = options;

    inlineRules = copy({}, inline);
    blockRules = copy({}, block);

    self.inlineRules = inlineRules;
    self.blockRules = blockRules;

    self.footnoteCounter = 1;

    self.inLink = false;
    self.atTop = true;
    self.atStart = true;
    self.inBlockquote = false;

    if (options.breaks) {
        inlineRules.break = breaksBreak;
        inlineRules.text = breaksText;
    }

    if (options.gfm) {
        inlineRules.text = gfmText;
        inlineRules.deletion = gfmDeletion;
        inlineRules.url = gfmURL;
        inlineRules.escape = gfmEscape;

        blockRules.paragraph = gfmParagraph;
        blockRules.fences = gfmCodeFences;
    }

    if (options.gfm && options.breaks) {
        inlineRules.text = breaksGFMText;
    }

    /*
     * Tables only occur with `gfm: true`.
     */

    if (options.tables) {
        blockRules.table = gfmTable;
        blockRules.looseTable = gfmLooseTable;
    }

    if (options.pedantic) {
        inlineRules.strong = pedanticStrong;
        inlineRules.emphasis = pedanticEmphasis;
    }

    if (options.yaml) {
        blockRules.yamlFrontMatter = yamlFrontMatter;
    }

    if (options.footnotes) {
        blockRules.footnoteDefinition = footnoteDefinition;
    }
}

/**
 * Parse `value` into an AST.
 *
 * @param {string} value
 * @return {Object}
 */
Parser.prototype.parse = function (value) {
    var self,
        footnotes,
        footnotesAsArray,
        id,
        index,
        token,
        start,
        last;

    self = this;

    /*
     * Add an `offset` matrix, used to keep track of
     * syntax and white space indentation per line.
     */

    self.offset = {};

    value = self.tokenizeAll(self.tokenizeBlock(clean(value)));

    token = self.renderBlock('root', value);

    if (self.options.footnotes) {
        footnotes = self.footnotes;
        footnotesAsArray = self.footnotesAsArray;

        index = -1;

        while (footnotesAsArray[++index]) {
            id = footnotesAsArray[index];

            footnotes[id].children = self.tokenizeAll(footnotes[id].children);
        }

        token.footnotes = footnotes;
    }

    last = token.children[token.children.length - 1];

    token.position = {
        'start': {
            'line': 1,
            'column': 1
        }
    };

    token.position.end = last ? last.position.end : start;

    return token;
};

/**
 * Lex loop.
 *
 * @param {Array.<Object>} tokens
 * @return {Array.<Object>}
 */
Parser.prototype.tokenizeAll = function (tokens) {
    var self,
        index,
        length,
        out;

    self = this;

    out = [];

    index = -1;
    length = tokens.length;

    while (++index < length) {
        out[index] = self.tokenizeOne(tokens[index]);
    }

    return out;
};

/**
 * Tokenise a token.
 *
 * @param {Object} token
 * @return {Object}
 */
Parser.prototype.tokenizeOne = function (token) {
    var self,
        pos,
        type;

    self = this;

    type = token.type;
    pos = token.position;

    if (type === 'text') {
        token = self.renderBlock('paragraph', token.value);
        token.position = pos;
        token = self.tokenizeOne(token);
    } else if (
        type === 'heading' ||
        type === 'paragraph' ||
        type === 'tableCell'
    ) {
        token.children = self.tokenizeInline(token.children, pos.start);
    } else if (
        type === 'blockquote' ||
        type === 'list' ||
        type === 'listItem' ||
        type === 'table' ||
        type === 'tableHeader' ||
        type === 'tableRow'
    ) {
        token.children = self.tokenizeAll(token.children);
    }

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
    'linkDefinition': tokenizeLinkDefinition,
    'footnoteDefinition': tokenizeFootnoteDefinition,
    'looseTable': tokenizeTable,
    'table': tokenizeTable,
    'paragraph': tokenizeParagraph,
    'text': tokenizeText
};

/*
 * Expose order in which to parse block-level nodes.
 */

Parser.prototype.blockMethods = [
    'yamlFrontMatter',
    'newline',
    'code',
    'fences',
    'heading',
    'lineHeading',
    'horizontalRule',
    'blockquote',
    'list',
    'html',
    'linkDefinition',
    'footnoteDefinition',
    'looseTable',
    'table',
    'paragraph',
    'text'
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
    return function (value, location) {
        var self,
            line,
            column,
            offset,
            tokens,
            methods,
            tokenizers,
            rules,
            index,
            length,
            method,
            name,
            match,
            matched,
            valueLength;

        self = this;

        offset = self.offset;

        tokens = [];

        /*
         * Trim white space only lines.
         */

        value = (value || '').replace(EXPRESSION_SPACES_ONLY_LINE, '');

        if (!value) {
            return tokens;
        }

        methods = self[type + 'Methods'];
        tokenizers = self[type + 'Tokenizers'];
        rules = self[type + 'Rules'];

        /*
         * Positional information.
         */

        line = location ? location.line : 1;
        column = location ? location.column : 1;

        /**
         * Update line and column based on `value`.
         *
         * @param {string} subvalue
         */
        function updatePosition(subvalue) {
            var lines,
                lastIndex;

            lines = subvalue.match(/\n/g);

            if (lines) {
                line += lines.length;
            }

            lastIndex = subvalue.lastIndexOf('\n');

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
          var start;

          start = now();

          return function (node) {
              start = node.position ? node.position.start : start;

              node.position = new Position(start);

              return node;
          };
        }

        /**
         * Add `token` to `parent`, or `tokens`.
         *
         * @param {Object} parent
         * @param {Object?} token
         * @return {Object} The added or merged token.
         */
        function add(parent, token) {
            var prev,
                children;

            if (!token) {
                children = tokens;
                token = parent;
            } else {
                if (!parent.children) {
                    parent.children = [];
                }

                children = parent.children;
            }

            prev = children[children.length - 1];

            if (type === 'inline' && token.type === 'text') {
                token.value = he.decode(token.value);
            }

            if (
                prev &&
                token.type === prev.type &&
                token.type in MERGEABLE_NODES
            ) {
                token = MERGEABLE_NODES[token.type](prev, token, type);
            } else {
                children.push(token);
            }

            if (self.atStart && tokens.length) {
                self.exitStart();
            }

            return token;
        }

        /**
         * Remove `subvalue` from `value`.
         * Expects `subvalue` to be at the start from `value`,
         * and applies no validation.
         *
         * @param {string} subvalue
         * @return {Function} See add.
         */
        function eat(subvalue) {
            var pos;

            pos = position();

            value = value.substring(subvalue.length);

            updatePosition(subvalue);

            return function () {
                return pos(add.apply(null, arguments));
            };
        }

        /*
         * Expose `now` on `eat`.
         */

        eat.now = now;

        /*
         * Sync initial offset.
         */

        updatePosition('');

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
                    (!method.onlyAtStart || self.atStart) &&
                    (!method.onlyAtTop || self.atTop) &&
                    (!method.notInBlockquote || !self.inBlockquote) &&
                    (!method.notInLink || !self.inLink) &&
                    rules[name].exec(value);

                if (match) {
                    valueLength = value.length;

                    method.apply(self, [eat].concat(match));

                    matched = valueLength !== value.length;

                    /* istanbul ignore else */
                    if (matched) {
                        break;
                    }
                }
            }

            /* istanbul ignore if */
            if (!matched) {
                throw new Error(
                    'Infinite loop on byte: ' + value.charCodeAt(0)
                );
            }
        }

        return tokens;
    };
}

/**
 * Lex `value`.
 *
 * @param {string} value
 * @return {Array.<Object>}
 */

Parser.prototype.tokenizeBlock = tokenizeFactory('block');

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

Parser.prototype.inlineTokenizers = {
    'escape': tokenizeEscape,
    'autoLink': tokenizeAutoLink,
    'url': tokenizeURL,
    'tag': tokenizeTag,
    'link': tokenizeLink,
    'referenceLink': tokenizeReferenceLink,
    'invalidLink': tokenizeReferenceLink,
    'strong': tokenizeStrong,
    'emphasis': tokenizeEmphasis,
    'deletion': tokenizeDeletion,
    'code': tokenizeInlineCode,
    'break': tokenizeBreak,
    'text': tokenizeInlineText
};

Parser.prototype.inlineMethods = [
    'escape',
    'autoLink',
    'url',
    'tag',
    'link',
    'referenceLink',
    'invalidLink',
    'strong',
    'emphasis',
    'deletion',
    'code',
    'break',
    'text'
];

/**
 * Tokenise an inline value.
 *
 * @param {string} value
 * @return {Array.<Object>}
 */

Parser.prototype.tokenizeInline = tokenizeFactory('inline');

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
    return function () {
        var self,
            current;

        self = this;

        current = self[property];

        self[property] = !state;

        /**
         * State cancler, cancels the state if allowed.
         */
        return function () {
            self[property] = current;
        };
    };
}

Parser.prototype.enterLink = stateToggler('inLink', false);
Parser.prototype.exitTop = stateToggler('atTop', true);
Parser.prototype.exitStart = stateToggler('atStart', true);
Parser.prototype.enterBlockquote = stateToggler('inBlockquote', false);

/**
 * Transform a markdown document into an AST.
 *
 * @param {string} value
 * @param {Object?} options
 * @param {Function?} CustomParser
 * @return {Object}
 */
function parse(value, options, CustomParser) {
    if (typeof value !== 'string') {
        raise(value, 'value');
    }

    if (options === null || options === undefined) {
        options = {};
    } else if (typeof options !== 'object') {
        raise(options, 'options');
    } else {
        options = copy({}, options);
    }

    validate.bool(options, 'gfm', true);
    validate.bool(options, 'tables', options.gfm);
    validate.bool(options, 'yaml', true);
    validate.bool(options, 'footnotes', false);
    validate.bool(options, 'breaks', false);
    validate.bool(options, 'pedantic', false);

    if (!options.gfm && options.tables) {
        throw new Error(
            'Invalid value `' + options.tables + '` with ' +
            '`gfm: ' + options.gfm + '` for `options.tables`'
        );
    }

    return new (CustomParser || Parser)(options).parse(value);
}

/*
 * Expose `Parser` on `parse`.
 */

parse.Parser = Parser;

/*
 * Expose `parse` on `module.exports`.
 */

module.exports = parse;
