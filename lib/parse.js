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
    trimRight;

copy = utilities.copy;
raise = utilities.raise;
trimRight = utilities.trimRight;

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
    EXPRESSION_LINE_BREAKS,
    EXPRESSION_TAB,
    EXPRESSION_RIGHT_ALIGNMENT,
    EXPRESSION_CENTER_ALIGNMENT,
    EXPRESSION_NO_BREAK_SPACE,
    EXPRESSION_SYMBOL_FOR_NEW_LINE,
    EXPRESSION_SPACES_ONLY_LINE,
    EXPRESSION_TRAILING_NEW_LINES,
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
EXPRESSION_LINE_BREAKS = /\r\n|\r/g;
EXPRESSION_TAB = /\t/g;
EXPRESSION_RIGHT_ALIGNMENT = /^ *-+: *$/;
EXPRESSION_CENTER_ALIGNMENT = /^ *:-+: *$/;
EXPRESSION_NO_BREAK_SPACE = /\u00a0/g;
EXPRESSION_SYMBOL_FOR_NEW_LINE = /\u2424/g;
EXPRESSION_SPACES_ONLY_LINE = /^ +$/gm;
EXPRESSION_TRAILING_NEW_LINES = /\n+$/;
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

gfmCodeFences = /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/;

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
    eat($0)({
        'type': 'code',
        'lang': null,
        'value': removeIndent($0).replace(EXPRESSION_TRAILING_NEW_LINES, '')
    });
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
    eat($0)({
        'type': 'code',
        'lang': $2 || null,
        'value': removeIndent($3)
    });
}

/**
 * Tokenise an ATX-style heading.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole heading.
 * @param {string} $1 - Number of hashes.
 * @param {string} $2 - Content.
 */
function tokenizeHeading(eat, $0, $1, $2) {
    eat($0)({
        'type': 'heading',
        'depth': $1.length,
        'children': $2
    });
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
    eat($0)({
        'type': 'heading',
        'depth': $2 === EQUALS ? 1 : 2,
        'children': $1
    });
}

/**
 * Tokenise a horizontal rule.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole rule.
 */
function tokenizeHorizontalRule(eat, $0) {
    eat($0)({
        'type': 'horizontalRule'
    });
}

/**
 * Tokenise a blockquote.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole blockquote.
 */
function tokenizeBlockquote(eat, $0) {
    var self,
        add,
        wasInBlockquote;

    self = this;

    add = eat($0);

    add({
        'type': 'blockquote'
    });

    wasInBlockquote = self.inBlockquote;

    self.inBlockquote = true;

    self.token($0.replace(EXPRESSION_BLOCK_QUOTE, ''));

    self.inBlockquote = wasInBlockquote;

    add({
        'type': 'blockquoteEnd'
    });
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
        match,
        bullet,
        expression,
        otherBullet,
        index,
        length,
        space,
        token,
        loose,
        add,
        wasTop,
        wasInBlockquote;

    self = this;

    bullet = $2;

    add = eat($0);

    add({
        'type': 'list',
        'ordered': bullet.length > 1
    });

    eat.backpedal($0);

    /*
     * Get each top-level token.
     */

    match = $0.match(self.rules.item);

    length = match.length;
    index = -1;

    while (++index < length) {
        token = match[index];

        /*
         * Remove the list token's bullet so it is seen as the
         * next token.
         */

        space = token.length;
        token = token.replace(EXPRESSION_BULLET, '');

        /*
         * Exdent whatever the list token contains.  Hacky.
         */

        if (token.indexOf('\n ') !== -1) {
            space -= token.length;

            expression = self.options.pedantic ?
                EXPRESSION_INITIAL_INDENT :
                new RegExp('^ {1,' + space + '}', 'gm');

            token = token.replace(expression, '');
        }

        /*
         * Determine whether the next list token belongs here.
         *
         * Backpedal if it does not belong in this list.
         */

        if (!self.options.pedantic && index !== length - 1) {
            otherBullet = block.bullet.exec(match[index + 1])[0];

            if (
                bullet !== otherBullet &&
                !(
                    bullet.length > 1 &&
                    otherBullet.length > 1
                )
            ) {
                eat.backpedal(match.slice(index + 1).join(NEW_LINE));

                /*
                 * Make sure to stop after this iteration.
                 */

                index = length;
            }
        }

        /*
         * Determine whether token is loose or not.
         */

        loose = EXPRESSION_LOOSE_LIST_ITEM.test(token);

        if (index !== length - 1 && !loose) {
            loose = token.charAt(token.length - 1) === NEW_LINE;
        }

        add({
            'type': loose ? 'looseItem' : 'listItem'
        });

        /*
         * Tokenise the list token.
         */

        wasTop = self.top;
        wasInBlockquote = self.inBlockquote;

        self.top = false;
        self.inBlockquote = true;

        self.token(token);

        self.top = wasTop;
        self.inBlockquote = wasInBlockquote;

        add({
            'type': 'listItemEnd'
        });
    }

    eat($0);

    add({
        'type': 'listEnd'
    });
}

/**
 * Tokenise a link definition.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole HTML.
 */
function tokenizeHtml(eat, $0) {
    eat($0)({
        'type': 'html',
        'value': $0
    });
}

/**
 * Tokenise a link definition.
 *
 * @property {boolean} topOnly
 * @property {boolean} notinBlockquote
 * @param {function(string)} eat
 * @param {string} $0 - Whole definition.
 * @param {string} $1 - Key.
 * @param {string} $2 - URL.
 * @param {string} $3 - Title.
 */
function tokenizeLinkDefinition(eat, $0, $1, $2, $3) {
    this.links[$1.toLowerCase()] = eat($0)({}, {
        'type': null,
        'href': $2,
        'title': $3
    });
}

tokenizeLinkDefinition.topOnly = true;
tokenizeLinkDefinition.notinBlockquote = true;

/**
 * Tokenise a footnote definition.
 *
 * @property {boolean} topOnly
 * @property {boolean} notinBlockquote
 * @param {function(string)} eat
 * @param {string} $0 - Whole definition.
 * @param {string} $1 - Whole key.
 * @param {string} $2 - Key.
 * @param {string} $3 - Whole value.
 */
function tokenizeFootnoteDefinition(eat, $0, $1, $2, $3) {
    var self,
        token,
        index,
        tokens,
        wasInBlockquote;

    self = this;

    token = eat($0)({}, {
        'type': null,
        'children': []
    });

    tokens = self.tokens;
    index = tokens.length;

    wasInBlockquote = self.inBlockquote;

    self.inBlockquote = true;

    self.token($3.replace(EXPRESSION_INITIAL_TAB, ''));

    self.inBlockquote = wasInBlockquote;

    token.children = tokens.splice(index);

    self.footnotes[$2.toLowerCase()] = token.children;
}

tokenizeFootnoteDefinition.topOnly = true;
tokenizeFootnoteDefinition.notinBlockquote = true;

/**
 * Tokenise a table.
 *
 * @property {boolean} topOnly
 * @param {function(string)} eat
 * @param {string} $0 - Whole table.
 * @param {string} $1 - Whole heading.
 * @param {string} $2 - Trimmed heading.
 * @param {string} $3 - Whole alignment.
 * @param {string} $4 - Trimmed alignment.
 * @param {string} $5 - Rows.
 */
function tokenizeTable(eat, $0, $1, $2, $3, $4, $5) {
    var add,
        token,
        values,
        index,
        length,
        row,
        rowIndex,
        rowLength;

    add = eat($0);

    token = add({
        'type': 'table',
        'align': []
    });

    eat.backpedal($0);

    /*
     * Add the table header to table's children.
     */
    eat($1)(token, {
        'type': 'tableHeader',
        'children': $2
            .replace(EXPRESSION_TABLE_FENCE_PADDED, '')
            .split(EXPRESSION_TABLE_BORDER)
    });

    eat($3);

    token.align = getAlignment(
        $4.replace(EXPRESSION_TABLE_FENCE, '').split(EXPRESSION_TABLE_BORDER)
    );

    eat($5);

    values = $5.replace(EXPRESSION_TABLE_LAST_FENCE, '').split(NEW_LINE);

    index = -1;
    length = values.length;

    /*
     * Add all other rows to table's children.
     */

    while (++index < length) {
        add(token, {
            'type': 'tableRow',
            'children': values[index]
                .replace(EXPRESSION_TABLE_INITIAL_OR_FINAL_FENCE, '')
                .split(EXPRESSION_TABLE_BORDER)
        });
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
            row[rowIndex] = {
                'type': 'tableCell',
                'children': row[rowIndex]
            };
        }
    }
}

tokenizeTable.topOnly = true;

/**
 * Tokenise a paragraph token.
 *
 * @property {boolean} topOnly
 * @param {function(string)} eat
 * @param {string} $0
 */
function tokenizeParagraph(eat, $0) {
    $0 = trimRight($0);

    eat($0)({
        'type': 'paragraph',
        'children': $0
    });
}

tokenizeParagraph.topOnly = true;

/**
 * Tokenise a text token.
 *
 * @param {function(string)} eat
 * @param {string} $0
 */
function tokenizeText(eat, $0) {
    eat($0)({
        'type': 'text',
        'value': he.decode($0)
    });
}

/**
 * Construct a new block lexer.
 *
 * @param {Object?} options
 * @constructor Lexer
 */
function Lexer(options) {
    var self,
        rules;

    self = this;

    self.tokens = [];
    self.links = {};
    self.footnotes = null;
    self.options = options;

    rules = copy({}, block);

    if (options.gfm) {
        rules.paragraph = gfmParagraph;
        rules.fences = gfmCodeFences;
    }

    /*
     * Tables only occur with `gfm: true`.
     */

    if (options.tables) {
        rules.table = gfmTable;
        rules.looseTable = gfmLooseTable;
    }

    if (options.footnotes) {
        rules.footnoteDefinition = footnoteDefinition;

        self.footnotes = {};
    }

    self.rules = rules;
}

/**
 * Preprocessing
 *
 * @param {string} value
 * @return {Array.<Object>}
 */
Lexer.prototype.lex = function (value) {
    var self;

    self = this;

    value = value
        .replace(EXPRESSION_LINE_BREAKS, NEW_LINE)
        .replace(EXPRESSION_TAB, '        ')
        .replace(EXPRESSION_NO_BREAK_SPACE, SPACE)
        .replace(EXPRESSION_SYMBOL_FOR_NEW_LINE, NEW_LINE);

    self.top = true;
    self.inBlockquote = false;

    return self.token(value);
};

Lexer.prototype.tokenizers = {
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

Lexer.prototype.methods = [
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
Lexer.prototype.token = function (value) {
    var self,
        tokens,
        methods,
        index,
        length,
        method,
        name,
        match,
        matched;

    self = this;

    value = value.replace(EXPRESSION_SPACES_ONLY_LINE, '');

    tokens = self.tokens;

    methods = self.methods;

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
        } else if (
            prev &&
            prev.type === 'blockquoteEnd' &&
            token.type === 'blockquote'
        ) {
            children.pop();
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
        length = methods.length;
        matched = false;

        while (++index < length) {
            name = methods[index];

            method = self.tokenizers[name];

            match = self.rules[name] &&
                (!method.topOnly || self.top) &&
                (!method.notinBlockquote || !self.inBlockquote) &&
                self.rules[name].exec(value);

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
 * Inline Lexer & Compiler
 */

/**
 * Construct a new inline lexer.
 *
 * @param {Object?} options
 * @param {Object} links
 * @param {Object} footnotes
 * @constructor InlineLexer
 */
function InlineLexer(options, links, footnotes) {
    var self,
        rules;

    self = this;

    options = copy({}, options);
    rules = copy({}, inline);

    self.options = options;

    links = copy({}, links);

    self.links = links;
    self.footnotes = footnotes;

    self.footnoteCounter = 1;

    self.footnotesAsArray = footnotes ? utilities.keys(footnotes) : [];

    self.inLink = false;

    if (options.breaks) {
        rules.break = breaksBreak;
        rules.text = breaksText;
    }

    if (options.gfm) {
        rules.text = gfmText;
        rules.deletion = gfmDeletion;
        rules.url = gfmURL;
        rules.escape = gfmEscape;
    }

    if (options.gfm && options.breaks) {
        rules.text = breaksGFMText;
    }

    if (options.pedantic) {
        rules.strong = pedanticStrong;
        rules.emphasis = pedanticEmphasis;
    }

    self.rules = rules;
}

/**
 * Create a raw token.
 *
 * @param {string} type
 * @param {string} value
 * @return {Object}
 */
function raw(type, value) {
    return {
        'type': type,
        'value': value
    };
}

InlineLexer.prototype.raw = raw;

/**
 * Create a link token.
 *
 * @param {boolean} isLink - Whether page or image reference.
 * @param {string} href
 * @param {string} text
 * @param {string?} title
 * @return {Object}
 */
function link(isLink, href, text, title) {
    var token;

    token = {
        'type': isLink ? 'link' : 'image',
        'title': title || null
    };

    if (isLink) {
        this.inLink = true;

        token.href = href;
        token.children = this.token(text);

        this.inLink = false;
    } else {
        token.src = href;
        token.alt = text || null;
    }

    return token;
}

InlineLexer.prototype.link = link;

/**
 * Add a token with inline content.
 *
 * @param {string} type
 * @param {string} value
 * @return {Object}
 */
function inlineToken(type, value) {
    return {
        'type': type,
        'children': this.token(value)
    };
}

InlineLexer.prototype.inlineToken = inlineToken;

/**
 * Tokenise an escaped sequence.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole escape.
 * @param {string} $1 - Escaped character.
 */
function tokenizeEscape(eat, $0, $1) {
    eat($0)(this.raw('text', $1));
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

    eat($0)(this.link(true, href, text));
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
function tokenizeUrl(eat, $0, $1) {
    eat($0)(this.link(true, $1, $1));
}

tokenizeUrl.notInLink = true;

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

    eat($0)(self.raw('html', $0));
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
    eat($0)(this.link($0.charAt(0) !== EXCLAMATION_MARK, $2, $1, $3));
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
        footnote;

    self = this;

    text = ($2 || $1).replace(EXPRESSION_WHITE_SPACES, SPACE);
    url = self.links[text.toLowerCase()];

    if (
        self.footnotes &&
        text.charAt(0) === CARET &&
        self.footnotes[text.substr(1)]
    ) {
        /*
         * All block-level footnote-definitions
         * are already found.  If we find the
         * provided ID in the footnotes hash, its
         * most certainly a footnote.
         */

        eat($0)({
            'type': 'footnote',
            'id': text.substr(1)
        });
    } else if (!url || !url.href) {
        if (
            self.footnotes &&
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

            footnote = String(self.footnoteCounter);

            self.footnotes[footnote] = [{
                'type': 'paragraph',
                'children': text.substr(1)
            }];

            self.footnotesAsArray.push(footnote);

            eat($0)({
                'type': 'footnote',
                'id': footnote
            });
        } else {
            eat($0.charAt(0))(self.raw('text', $0.charAt(0)));
        }
    } else {
        eat($0)(self.link(
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
    eat($0)(this.inlineToken('strong', $2 || $1));
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
    eat($0)(this.inlineToken('emphasis', $2 || $1));
}

/**
 * Tokenise a deletion.
 *
 * @param {function(string)} eat
 * @param {string} $0 - Whole deletion.
 * @param {string} $1 - Content.
 */
function tokenizeDeletion(eat, $0, $1) {
    eat($0)(this.inlineToken('delete', $1));
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
    eat($0)(this.raw('inlineCode', trimRight($2)));
}

/**
 * Tokenise a break.
 *
 * @param {function(string)} eat
 * @param {string} $0
 */
function tokenizeBreak(eat, $0) {
    eat($0)({
        'type': 'break'
    });
}

/**
 * Tokenise inline text.
 *
 * @param {function(string)} eat
 * @param {string} $0
 */
function tokenizeInlineText(eat, $0) {
    eat($0)(this.raw('text', $0));
}

InlineLexer.prototype.tokenizers = {
    'escape': tokenizeEscape,
    'autoLink': tokenizeAutoLink,
    'url': tokenizeUrl,
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

InlineLexer.prototype.methods = [
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
InlineLexer.prototype.token = function (value) {
    var self,
        tokens,
        methods,
        index,
        length,
        method,
        name,
        match,
        matched;

    self = this;

    tokens = [];

    methods = self.methods;

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
        length = methods.length;
        matched = false;

        while (++index < length) {
            name = methods[index];

            method = self.tokenizers[name];

            match = self.rules[name] &&
                (!method.notInLink || !self.inLink) &&
                self.rules[name].exec(value);

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
 * Parsing & Compiling
 */

/**
 * Construct a new parser.
 *
 * @param {Object?} options
 * @constructor Parser
 */
function Parser(options) {
    var self;

    self = this;

    self.tokens = [];
    self.token = null;
    self.options = options;

    self.block = new Lexer(options);
}

/**
 * Parse `value` into an AST.
 *
 * @param {string} value
 * @return {Object}
 */
Parser.prototype.parse = function (value) {
    var self,
        tokens,
        links,
        footnotes,
        footnotesAsArray,
        footnote,
        index;

    self = this;

    tokens = self.block.lex(value);
    links = copy(self.block.links);
    footnotes = copy(self.block.footnotes);

    self.inline = new InlineLexer(self.options, links, footnotes);

    console.log(tokens);

    tokens = self.lex(tokens);

    footnotesAsArray = self.inline.footnotesAsArray;

    if (footnotes) {
        index = -1;

        while (footnotesAsArray[++index]) {
            footnote = footnotesAsArray[index];
            footnotes[footnote] = self.lex(footnotes[footnote]);
        }
    }

    return {
        'type': 'root',
        'children': tokens,
        'footnotes': footnotes
    };
};

/**
 * Lex loop.
 *
 * @param {string} value
 * @return {Array.<Object>}
 */
Parser.prototype.lex = function (value) {
    var self,
        out;

    self = this;

    self.tokens = value.reverse();

    out = [];

    while (self.next()) {
        out.push(self.tok());
    }

    return out;
};

/**
 * Go to the next token.
 *
 * @return {Object}
 */
Parser.prototype.next = function () {
    this.token = this.tokens.pop();

    return this.token;
};

/*
 * Parse Current Token
 */

var pairMap;

pairMap = {
    'blockquote': 'blockquoteEnd',
    'list': 'listEnd',
    'looseItem': 'listItemEnd',
    'listItem': 'listItemEnd'
};

/**
 * Tokenise a token.
 *
 * @return {Object}
 */
Parser.prototype.tok = function () {
    var self,
        token,
        type,
        children,
        queue,
        cells,
        endToken,
        index,
        cellIterator,
        length,
        cellLength;

    self = this;

    token = self.token;
    type = token.type;

    if (
        type === 'horizontalRule' ||
        type === 'code' ||
        type === 'inlineCode' ||
        type === 'html'
    ) {
        return token;
    }

    if (type === 'table') {
        index = -1;
        children = token.children;
        length = children.length;

        while (++index < length) {
            cellIterator = -1;
            cells = children[index].children;
            cellLength = cells.length;

            while (++cellIterator < cellLength) {
                cells[cellIterator].children =
                    self.inline.token(cells[cellIterator].children);
            }
        }

        return token;
    }

    if (type === 'heading' || type === 'paragraph') {
        token.children = self.inline.token(token.children);

        return token;
    }

    if (type === 'blockquote' || type === 'list') {
        children = [];
        endToken = pairMap[type];

        while (self.next().type !== endToken) {
            children = children.concat(self.tok());
        }

        token.children = children;

        return token;
    }

    if (type === 'looseItem' || type === 'listItem') {
        children = [];
        endToken = pairMap[type];

        while (self.next().type !== endToken) {
            queue = self.tok();

            if ('length' in queue) {
                queue = {
                    'type': 'paragraph',
                    'children': queue
                };
            }

            children.push(queue);
        }

        token.type = 'listItem';
        token.loose = type === 'looseItem';
        token.children = children;

        return token;
    }

    /* istanbul ignore else */
    if (type === 'text') {
        return self.inline.token(self.token.value);
    }

    /* istanbul ignore next */
    return token;
};

/**
 * Transform a markdown document into an AST.
 *
 * @param {string} value
 * @param {Object?} options
 * @return {Object}
 */
function parse(value, options) {
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

    return new Parser(options).parse(value);
}

/*
 * Expose
 */

parse.Parser = Parser;

parse.Lexer = Lexer;

module.exports = parse;
