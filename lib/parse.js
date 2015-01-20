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
    clean;

copy = utilities.copy;
raise = utilities.raise;
trimRight = utilities.trimRight;
clean = utilities.clean;

/*
 * Constants.
 */

var MAILTO_PROTOCOL,
    EQUALS,
    AT_SIGN,
    EXCLAMATION_MARK,
    SPACE,
    NEW_LINE,
    CARET;

MAILTO_PROTOCOL = 'mailto:';
EQUALS = '=';
AT_SIGN = '@';
EXCLAMATION_MARK = '!';
SPACE = ' ';
NEW_LINE = '\n';
CARET = '^';

/*
 * Expressions.
 */

var EXPRESSION_START,
    EXPRESSION_INITIAL_SPACES,
    EXPRESSION_RIGHT_ALIGNMENT,
    EXPRESSION_CENTER_ALIGNMENT,
    EXPRESSION_SPACES_ONLY_LINE,
    EXPRESSION_FINAL_NEW_LINES,
    EXPRESSION_TABLE_FENCE,
    EXPRESSION_TABLE_FENCE_PADDED,
    EXPRESSION_TABLE_INITIAL_OR_FINAL_FENCE,
    EXPRESSION_TABLE_BORDER,
    EXPRESSION_TABLE_LAST_FENCE,
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
EXPRESSION_FINAL_NEW_LINES = /\n+$/;
EXPRESSION_TABLE_FENCE = /^ *|\| *$/g;
EXPRESSION_TABLE_FENCE_PADDED = /^ *| *\| *$/g;
EXPRESSION_TABLE_INITIAL_OR_FINAL_FENCE = /^ *\| *| *\| *$/g;
EXPRESSION_TABLE_BORDER = / *\| */;
EXPRESSION_TABLE_LAST_FENCE = /(?: *\| *)?\n$/;
EXPRESSION_BLOCK_QUOTE = /^ *> ?/gm;
EXPRESSION_BULLET = /^ *([*+-]|\d+\.) +/;
EXPRESSION_INITIAL_INDENT = /^ {1,4}/gm;
EXPRESSION_INITIAL_TAB = /^ {4}/gm;
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

block.horizontalRule = /^( *[-*_]){3,} *(?:\n+|$)/;

block.heading = /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/;

block.lineHeading = /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/;

block.linkDefinition =
    /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/;

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

            '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))' +
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
    /^( *(\S.*\|.*)\n)( *([-:]+ *\|[-| :]*)\n)((?:.*\|.*(?:\n|$))*)/;

gfmTable = /^( *\|(.+)\n)( *\|( *[-:]+[-| :]*)\n)((?: *\|.*(?:\n|$))*)/;

/*
 * GFM Block Grammar
 */

var gfmCodeFences,
    gfmParagraph;

gfmCodeFences = /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/;

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
 * Inline-Level Grammar.
 */

var inline;

inline = {};

inline.escape = /^\\([\\`*{}\[\]()#+\-.!_>])/;

inline.autoLink = /^<([^ >]+(@|:\/)[^ >]+)>/;

inline.tag = /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/;

inline.invalidLink = /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/;

inline.strong = /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/;

inline.emphasis = /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/;

inline.code = /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/;

inline.break = /^ {2,}\n(?!\s*$)/;

inline.text = /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/;

inline.inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;

inline.href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = new RegExp(
    '^!?\\[(' +
        cleanExpression(inline.inside) +
    ')\\]\\(' +
        cleanExpression(inline.href) +
    '\\)'
);

inline.referenceLink = new RegExp(
    '^!?\\[(' +
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
    prev.value += token.value;

    return prev;
};

/**
 * Merge two text nodes: `token` into `prev`.
 *
 * @param {Object} prev
 * @param {Object} token
 * @return {Object} `prev`.
 */
MERGEABLE_NODES.text = function (prev, token) {
    prev.value += '\n' + token.value;

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
 * @param {string} $1 - Hashes.
 * @param {string} $2 - Content.
 */
function tokenizeHeading(eat, $0, $1, $2) {
    eat($0)(this.renderHeading($2, $1.length));
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
    eat($0)(this.renderBlockquote($0));
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
        matches,
        firstBullet,
        bullet,
        index,
        length,
        add,
        enterTop,
        exitBlockquote,
        list;

    self = this;

    firstBullet = $2;

    /*
     * Parse the list.
     */

    matches = trimRight($0).match(self.blockRules.item);

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

                break;
            }
        }

        if (matches.length !== length) {
            $0 = matches.join(NEW_LINE);

            length = matches.length;
        }
    }

    index = -1;

    add = eat($0);

    enterTop = self.exitTop();
    exitBlockquote = self.enterBlockquote();

    list = add(self.renderList([], firstBullet.length > 1));

    while (++index < length) {
        add(list, self.renderListItem(matches[index]));
    }

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
        token;

    self = this;

    token = eat($0)({}, self.renderFootnoteDefinition(
        $2.toLowerCase(), $3.replace(EXPRESSION_INITIAL_TAB, '')
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
        add,
        token,
        index,
        length,
        values,
        value,
        row,
        rowIndex,
        rowLength;

    self = this;

    add = eat($0);

    token = add({
        'type': 'table',
        'align': []
    });

    eat.backpedal($0);

    /*
     * Add the table header to table's children.
     */

    $2 = $2
        .replace(EXPRESSION_TABLE_FENCE_PADDED, '')
        .split(EXPRESSION_TABLE_BORDER);

    eat($1)(token, self.renderBlock('tableHeader', $2));

    /*
     * Add the table's alignment.
     */

    eat($3);

    $4 = $4
        .replace(EXPRESSION_TABLE_FENCE, '')
        .split(EXPRESSION_TABLE_BORDER);

    token.align = getAlignment($4);

    /*
     * Add the table rows to table's children.
     */

    eat($5);

    $5 = $5
        .replace(EXPRESSION_TABLE_LAST_FENCE, '')
        .split(NEW_LINE);

    index = -1;
    length = $5.length;

    while (++index < length) {
        value = $5[index]
            .replace(EXPRESSION_TABLE_INITIAL_OR_FINAL_FENCE, '')
            .split(EXPRESSION_TABLE_BORDER);

        add(token, self.renderBlock('tableRow', value));
    }

    /*
     * Add table cells in each row (incl. header).
     */

    values = token.children;
    index = -1;
    length = values.length;

    while (++index < length) {
        row = values[index].children;
        rowIndex = -1;
        rowLength = row.length;

        while (++rowIndex < rowLength) {
            row[rowIndex] = add({}, self.renderBlock(
                'tableCell', row[rowIndex]
            ));
        }
    }
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
        'value': removeIndent(value || '')
            .replace(EXPRESSION_FINAL_NEW_LINES, '')
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
function renderListItem(token) {
    var space,
        expression,
        loose;

    space = 0;

    /*
     * Remove the list token's bullet so it is seen as the
     * next token.
     */

    token = token.replace(EXPRESSION_BULLET, function ($0) {
        // eat($0)
        space = $0.length;

        return '';
    });

    /*
     * Exdent whatever the list token contains.  Hacky.
     */

    if (token.indexOf('\n ') !== -1) {
        expression = this.options.pedantic ?
            EXPRESSION_INITIAL_INDENT :
            new RegExp('^ {1,' + space + '}', 'gm');

        token = token.replace(expression, '');
    }

    /*
     * Determine whether token is loose or not.
     */

    loose = EXPRESSION_LOOSE_LIST_ITEM.test(token) ||
        token.charAt(token.length - 1) === NEW_LINE;

    return {
        'type': 'listItem',
        'loose': loose,
        'children': this.tokenizeBlock(token)
    };
}

/**
 * Create a footnote-definition token.
 *
 * @param {string} id
 * @param {string} value
 * @return {Object}
 */
function renderFootnoteDefinition(id, value) {
    var self,
        token,
        exitBlockquote;

    self = this;

    exitBlockquote = self.enterBlockquote();

    token = {
        'type': 'footnoteDefinition',
        'id': id,
        'children': self.tokenizeBlock(value)
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
function renderBlockquote(value) {
    var self,
        token,
        exitBlockquote;

    self = this;

    exitBlockquote = self.enterBlockquote();

    value = value.replace(EXPRESSION_BLOCK_QUOTE, '');

    token = {
        'type': 'blockquote',
        'children': this.tokenizeBlock(value)
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
function renderLink(isLink, href, text, title) {
    var token,
        exitLink;

    token = {
        'type': isLink ? 'link' : 'image',
        'title': title || null
    };

    if (isLink) {
        exitLink = this.enterLink();

        token.href = href;
        token.children = this.tokenizeInline(text);

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
function renderInline(type, value) {
    return {
        'type': type,
        'children': this.tokenizeInline(value)
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
    eat($0)(this.renderRaw('text', $1));
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
        text;

    href = $1;
    text = $1;

    if ($2 === AT_SIGN) {
        if (text.substr(0, MAILTO_PROTOCOL.length) !== MAILTO_PROTOCOL) {
            href = MAILTO_PROTOCOL + text;
        } else {
            text = text.substr(MAILTO_PROTOCOL.length);
        }
    }

    eat($0)(this.renderLink(true, href, text));
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
    eat($0)(this.renderLink(true, $1, $1));
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
 * @property {boolean} notInLink
 * @param {function(string)} eat
 * @param {string} $0 - Whole link.
 * @param {string} $1 - Content.
 * @param {string} $2 - URL.
 * @param {string?} $3 - Title.
 */
function tokenizeLink(eat, $0, $1, $2, $3) {
    eat($0)(this.renderLink($0.charAt(0) !== EXCLAMATION_MARK, $2, $1, $3));
}

tokenizeLink.notInLink = true;

/**
 * Tokenise a reference link, invalid link, or inline
 * footnote, or reference footnote.
 *
 * @property {boolean} notInLink
 * @param {function(string)} eat
 * @param {string} $0 - Whole link.
 * @param {string} $1 - URL.
 * @param {string} $2 - Content.
 */
function tokenizeReferenceLink(eat, $0, $1, $2) {
    var self,
        text,
        url,
        token;

    self = this;

    text = ($2 || $1).replace(EXPRESSION_WHITE_SPACES, SPACE);
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

            token = self.renderFootnoteDefinition(
                String(self.footnoteCounter), text.substr(1)
            );

            self.footnotes[token.id] = token;

            eat($0)(self.renderFootnote(token.id));
        } else {
            eat($0.charAt(0))(self.renderRaw('text', $0.charAt(0)));
        }
    } else {
        eat($0)(self.renderLink(
            $0.charAt(0) !== EXCLAMATION_MARK, url.href, $1, url.title
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
    eat($0)(this.renderInline('strong', $2 || $1));
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
    eat($0)(this.renderInline('emphasis', $2 || $1));
}

/**
 * Tokenise a deletion.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole deletion.
 * @param {string} $1 - Content.
 */
function tokenizeDeletion(eat, $0, $1) {
    eat($0)(this.renderInline('delete', $1));
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
        token;

    self = this;

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
        type,
        children,
        cells,
        index,
        cellIterator,
        length,
        cellLength;

    self = this;

    type = token.type;

    if (type === 'text') {
        token = self.tokenizeOne(self.renderBlock('paragraph', token.value));
    } else if (type === 'table') {
        index = -1;
        children = token.children;
        length = children.length;

        while (++index < length) {
            cellIterator = -1;
            cells = children[index].children;
            cellLength = cells.length;

            while (++cellIterator < cellLength) {
                cells[cellIterator].children =
                    self.tokenizeInline(cells[cellIterator].children);
            }
        }
    } else if (
        type === 'heading' ||
        type === 'paragraph'
    ) {
        token.children = self.tokenizeInline(token.children);
    } else if (
        type === 'blockquote' ||
        type === 'list' ||
        type === 'listItem'
    ) {
        token.children = self.tokenizeAll(token.children);
    }

    return token;
};

/*
 * Expose tokenizers for block-level nodes.
 */

Parser.prototype.blockTokenizers = {
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
 * Lex `value`.
 *
 * @param {string} value
 * @return {Array.<Object>}
 */
Parser.prototype.tokenizeBlock = function (value) {
    var self,
        tokens,
        blockMethods,
        blockTokenizers,
        blockRules,
        index,
        length,
        method,
        name,
        match,
        matched;

    self = this;

    value = value.replace(EXPRESSION_SPACES_ONLY_LINE, '');

    tokens = [];

    blockMethods = self.blockMethods;
    blockTokenizers = self.blockTokenizers;
    blockRules = self.blockRules;

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

        if (
            prev &&
            token.type === prev.type &&
            token.type in MERGEABLE_NODES
        ) {
            token = MERGEABLE_NODES[token.type](prev, token);
        } else {
            children.push(token);
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
        value = value.substring(subvalue.length);

        return add;
    }

    /**
     * Add `subvalue` back to `value`.
     *
     * @param {string} subvalue
     */
    function backpedal(subvalue) {
        value = subvalue + value;
    }

    /*
     * Expose `backpedal` on `eat`.
     */

    eat.backpedal = backpedal;

    /*
     * Iterate over `value`, and iterate over all
     * block-expressions.  When one matches, invoke
     * its companion function.  If no expression
     * matches, something failed (should not happen)
     * and an expression is thrown.
     */

    while (value) {
        index = -1;
        length = blockMethods.length;
        matched = false;

        while (++index < length) {
            name = blockMethods[index];

            method = blockTokenizers[name];

            match = blockRules[name] &&
                (!method.onlyAtTop || self.atTop) &&
                (!method.notInBlockquote || !self.inBlockquote) &&
                blockRules[name].exec(value);

            if (match) {
                method.apply(self, [eat].concat(match));

                matched = true;

                break;
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
Parser.prototype.tokenizeInline = function (value) {
    var self,
        tokens,
        inlineMethods,
        inlineTokenizers,
        inlineRules,
        index,
        length,
        method,
        name,
        match,
        matched;

    self = this;

    tokens = [];

    inlineMethods = self.inlineMethods;
    inlineTokenizers = self.inlineTokenizers;
    inlineRules = self.inlineRules;

    /**
     * Add `token` to `children`.
     *
     * @param {Object?} token
     * @return {Object} The added or merged token.
     */
    function add(token) {
        var prev;

        prev = tokens[tokens.length - 1];

        if (token.type === 'text') {
            token.value = he.decode(token.value);
        }

        if (prev && prev.type === token.type && 'value' in prev) {
            prev.value += token.value;
            token = prev;
        } else {
            tokens.push(token);
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
        value = value.substring(subvalue.length);

        return add;
    }

    /*
     * Iterate over `value`, and iterate over all
     * block-expressions.  When one matches, invoke
     * its companion function.  If no expression
     * matches, something failed (should not happen)
     * and an expression is thrown.
     */

    while (value) {
        index = -1;
        length = inlineMethods.length;
        matched = false;

        while (++index < length) {
            name = inlineMethods[index];

            method = inlineTokenizers[name];

            match = inlineRules[name] &&
                (!method.notInLink || !self.inLink) &&
                inlineRules[name].exec(value);

            if (match) {
                method.apply(self, [eat].concat(match));

                matched = true;

                break;
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
    var gfm,
        tables,
        footnotes,
        breaks,
        pedantic;

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

    gfm = options.gfm;
    tables = options.tables;
    footnotes = options.footnotes;
    breaks = options.breaks;
    pedantic = options.pedantic;

    if (gfm === null || gfm === undefined) {
        options.gfm = true;

        gfm = options.gfm;
    } else if (typeof gfm !== 'boolean') {
        raise(gfm, 'options.gfm');
    }

    options.gfm = gfm;

    if (tables === null || tables === undefined) {
        options.tables = gfm;
    } else if (typeof tables !== 'boolean') {
        raise(tables, 'options.tables');
    } else if (!gfm && tables) {
        throw new Error(
            'Invalid value `' + tables + '` with ' +
            '`gfm: ' + gfm + '` for `options.tables`'
        );
    }

    if (footnotes === null || footnotes === undefined) {
        options.footnotes = false;
    } else if (typeof footnotes !== 'boolean') {
        raise(footnotes, 'options.footnotes');
    }

    if (breaks === null || breaks === undefined) {
        options.breaks = false;
    } else if (typeof breaks !== 'boolean') {
        raise(breaks, 'options.breaks');
    }

    if (pedantic === null || pedantic === undefined) {
        options.pedantic = false;
    } else if (typeof pedantic !== 'boolean') {
        raise(pedantic, 'options.pedantic');
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
