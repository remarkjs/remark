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
    raise;

copy = utilities.copy;
raise = utilities.raise;

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
 * for discount behavior.
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
 * Default options.
 */

var defaults;

defaults = {
    'gfm': true,
    'tables': true,
    'footnotes': false,
    'breaks': false,
    'pedantic': false
};

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
    self.tokens.links = {};
    self.tokens.footnotes = null;
    self.options = options;

    rules = copy({}, block);

    if (options.gfm) {
        rules.paragraph = gfmParagraph;
        rules.fences = gfmCodeFences;

        if (options.tables) {
            rules.table = gfmTable;
            rules.looseTable = gfmLooseTable;
        }
    }

    if (options.footnotes) {
        self.tokens.footnotes = {};
        rules.footnoteDefinition = footnoteDefinition;
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
    value = value
        .replace(EXPRESSION_LINE_BREAKS, NEW_LINE)
        .replace(EXPRESSION_TAB, '        ')
        .replace(EXPRESSION_NO_BREAK_SPACE, SPACE)
        .replace(EXPRESSION_SYMBOL_FOR_NEW_LINE, NEW_LINE);

    return this.token(value, true);
};

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
 * Tokenize a line.
 *
 * @param {function(string)} eat
 * @param {boolean} top
 * @param {string} $0 - Lines.
 */
function tokenizeNewline(eat, top, $0) {
    eat($0);
}

/**
 * Tokenize a code block.
 *
 * @param {function(string)} eat
 * @param {boolean} top
 * @param {string} $0 - Whole code.
 */
function tokenizeCode(eat, top, $0) {
    eat($0)({
        'type': 'code',
        'lang': null,
        'value': removeIndent($0).replace(EXPRESSION_TRAILING_NEW_LINES, '')
    });
}

/**
 * Tokenize a fenced code block.
 *
 * @param {function(string)} eat
 * @param {boolean} top
 * @param {string} $0 - Whole code.
 * @param {string} $1 - Fence.
 * @param {string} $2 - Programming language flag.
 * @param {string} $3 - Content.
 */
function tokenizeFences(eat, top, $0, $1, $2, $3) {
    eat($0)({
        'type': 'code',
        'lang': $2 || null,
        'value': removeIndent($3)
    });
}

/**
 * Tokenize an ATX-style heading.
 *
 * @param {function(string)} eat
 * @param {boolean} top
 * @param {string} $0 - Whole heading.
 * @param {string} $1 - Number of hashes.
 * @param {string} $2 - Content.
 */
function tokenizeHeading(eat, top, $0, $1, $2) {
    eat($0)({
        'type': 'heading',
        'depth': $1.length,
        'children': $2
    });
}

/**
 * Tokenize a Setext-style heading.
 *
 * @param {function(string)} eat
 * @param {boolean} top
 * @param {string} $0 - Whole heading.
 * @param {string} $1 - Content.
 * @param {string} $2 - Underline.
 */
function tokenizeLineHeading(eat, top, $0, $1, $2) {
    eat($0)({
        'type': 'heading',
        'depth': $2 === EQUALS ? 1 : 2,
        'children': $1
    });
}

/**
 * Tokenize a horizontal rule.
 *
 * @param {function(string)} eat
 * @param {boolean} top
 * @param {string} $0 - Whole blockquote.
 */
function tokenizeHorizontalRule(eat, top, $0) {
    eat($0)({
        'type': 'horizontalRule'
    });
}

/**
 * Tokenize a blockquote.
 *
 * @param {function(string)} eat
 * @param {boolean} top
 * @param {string} $0 - Whole blockquote.
 */
function tokenizeBlockquote(eat, top, $0) {
    var add;

    add = eat($0);

    add({
        'type': 'blockquote'
    });

    /*
     * Pass `top` to keep the current 'toplevel' state. This is
     * exactly how markdown.pl works.
     */

    this.token($0.replace(EXPRESSION_BLOCK_QUOTE, ''), top, true);

    add({
        'type': 'blockquoteEnd'
    });
}

/**
 * Tokenize a list.
 *
 * @param {function(string)} eat
 * @param {boolean} top
 * @param {string} $0 - Whole list.
 * @param {string} $1 - Indent.
 * @param {string} $2 - Bullet.
 */
function tokenizeList(eat, top, $0, $1, $2) {
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
        add;

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
         * Exdent whatever the list token contains. Hacky.
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

        self.token(token, false, true);

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
 * Tokenize a link definition.
 *
 * @param {function(string)} eat
 * @param {boolean} top
 * @param {string} $0 - Whole HTML.
 */
function tokenizeHtml(eat, top, $0) {
    eat($0)({
        'type': 'html',
        'value': $0
    });
}

/**
 * Tokenize a link definition.
 *
 * @param {function(string)} eat
 * @param {boolean} top
 * @param {string} $0 - Whole definition.
 * @param {string} $1 - Key.
 * @param {string} $2 - URL.
 * @param {string} $3 - Title.
 */
function tokenizeLinkDefinition(eat, top, $0, $1, $2, $3) {
    this.tokens.links[$1.toLowerCase()] = eat($0)({}, {
        'type': null,
        'href': $2,
        'title': $3
    });
}

/**
 * Tokenize a footnote definition.
 *
 * @param {function(string)} eat
 * @param {boolean} top
 * @param {string} $0 - Whole definition.
 * @param {string} $1 - Whole key.
 * @param {string} $2 - Key.
 * @param {string} $3 - Whole value.
 */
function tokenizeFootnoteDefinition(eat, top, $0, $1, $2, $3) {
    var token,
        index,
        tokens;

    token = eat($0)({}, {
        'type': null,
        'children': []
    });

    tokens = this.tokens;
    index = tokens.length;

    this.token($3.replace(EXPRESSION_INITIAL_TAB, ''), top, true);

    token.children = tokens.splice(index);

    tokens.footnotes[$2.toLowerCase()] = token.children;
}

/**
 * Tokenize a table.
 *
 * @param {function(string)} eat
 * @param {boolean} top
 * @param {string} $0 - Whole table.
 * @param {string} $1 - Whole heading.
 * @param {string} $2 - Trimmed heading.
 * @param {string} $3 - Whole alignment.
 * @param {string} $4 - Trimmed alignment.
 * @param {string} $5 - Rows.
 */
function tokenizeTable(eat, top, $0, $1, $2, $3, $4, $5) {
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

/**
 * Tokenize a paragraph token.
 *
 * @param {function(string)} eat
 * @param {boolean} top
 * @param {string} $0
 */
function tokenizeParagraph(eat, top, $0) {
    $0 = $0.trimRight();

    eat($0)({
        'type': 'paragraph',
        'children': $0
    });
}

/**
 * Tokenize a text token.
 *
 * @param {function(string)} eat
 * @param {boolean} top
 * @param {string} $0
 */
function tokenizeText(eat, top, $0) {
    eat($0)({
        'type': 'text',
        'value': he.decode($0)
    });
}

tokenizeLinkDefinition.topOnly = true;
tokenizeFootnoteDefinition.topOnly = true;
tokenizeTable.topOnly = true;
tokenizeParagraph.topOnly = true;

tokenizeLinkDefinition.notInBlockquote = true;
tokenizeFootnoteDefinition.notInBlockquote = true;

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
 * @param {boolean?} top - if the token is top-level
 * @param {boolean?} inBlockquote - if the token is in a block-quote
 * @return {Array.<Object>}
 */
Lexer.prototype.token = function (value, top, inBlockquote) {
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

    eat.backpedal = backpedal;

    while (value) {
        index = -1;
        length = methods.length;
        matched = false;

        while (++index < length) {
            name = methods[index];

            method = self.tokenizers[name];

            match = self.rules[name] &&
                (!method.topOnly || top) &&
                (!method.notInBlockquote || !inBlockquote) &&
                self.rules[name].exec(value);

            if (match) {
                method.apply(self, [eat, top].concat(match));

                matched = true;

                break;
            }
        }

        /* istanbul ignore if. */
        if (!matched) {
            throw new Error('Infinite loop on byte: ' + value.charCodeAt(0));
        }
    }

    return tokens;
};

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
 * Inline Lexer & Compiler
 */

/**
 * Construct a new inline lexer.
 *
 * @param {Object} links
 * @param {Object} footnotes
 * @param {Object?} options
 * @constructor InlineLexer
 */
function InlineLexer(links, footnotes, options) {
    var self,
        rules;

    self = this;

    self.options = options;
    self.links = links;
    self.footnoteCounter = 1;
    self.footnotes = footnotes;
    self.footnotesAsArray = footnotes ? Object.keys(footnotes) : [];

    rules = copy({}, inline);

    if (options.breaks) {
        rules.break = breaksBreak;
        rules.text = breaksText;
    }

    if (options.gfm) {
        rules.text = gfmText;
        rules.deletion = gfmDeletion;
        rules.URL = gfmURL;
        rules.escape = gfmEscape;

        if (options.breaks) {
            rules.text = breaksGFMText;
        }
    }

    if (options.pedantic) {
        rules.strong = pedanticStrong;
        rules.emphasis = pedanticEmphasis;
    }

    self.rules = rules;
}

/**
 * Add a token to `tokens.`
 *
 * @param {Array.<Object>} tokens
 * @param {string} type
 * @return {Object}
 */
InlineLexer.prototype.addToken = function (tokens, type) {
    var token;

    token = {
        'type': type
    };

    tokens.push(token);

    return token;
};

/**
 * Add an inline raw token.
 *
 * @param {Array.<Object>} tokens
 * @param {string} type
 * @param {string} value
 */
InlineLexer.prototype.addInlineToken = function (tokens, type, value) {
    this.addToken(tokens, type).children = this.outputInline(value);
};

/**
 * Add a raw token.
 *
 * @param {Array.<Object>} tokens
 * @param {string} type
 * @param {string} value
 */
InlineLexer.prototype.addRawToken = function (tokens, type, value) {
    var prev;

    prev = tokens[tokens.length - 1];

    if (type === 'text') {
        value = he.decode(value);
    }

    if (prev && prev.type === type && 'value' in prev) {
        prev.value += value;
    } else {
        this.addToken(tokens, type).value = value;
    }
};

/**
 * Add a a raw link.
 *
 * @param {Array.<Object>} tokens
 * @param {string} href
 * @param {string?} text
 * @param {string?} title
 */
InlineLexer.prototype.addRawLink = function (tokens, href, text, title) {
    var link;

    link = this.addToken(tokens, 'link');

    link.title = title || null;

    link.href = href;
    link.children = [];

    this.addRawToken(link.children, 'text', text);
};

/**
 * Add a link or an image.
 *
 * @param {Array.<Object>} tokens
 * @param {boolean} isLink
 * @param {string} href
 * @param {string?} text
 * @param {string?} title
 * @return {Object}
 */
InlineLexer.prototype.addLink = function (tokens, isLink, href, text, title) {
    var token;

    token = this.addToken(tokens, isLink ? 'link' : 'image');

    token.title = title || null;

    if (isLink) {
        this.inLink = true;

        token.href = href;
        token.children = this.outputInline(text);

        this.inLink = false;
    } else {
        token.src = href;
        token.alt = text || null;
    }

    return token;
};

/**
 * Add a footnote token
 *
 * @param {Array.<Object>} tokens
 * @param {number} id
 */
InlineLexer.prototype.addFootnoteToken = function (tokens, id) {
    this.addToken(tokens, 'footnote').id = id;
};

/**
 * Output inline tokens.
 *
 * @param {string} value
 * @return {Array.<Object>}
 */
InlineLexer.prototype.outputInline = function (value) {
    var tokens,
        link,
        footnote,
        text,
        href,
        match;

    tokens = [];

    while (value) {
        /*
         * Escape character (e.g., `\*\*not strong\*\*`).
         */

        match = this.rules.escape.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            this.addRawToken(tokens, 'text', match[1]);

            continue;
        }

        /*
         * A link between pointy brackets. (e.g., `<some@thing.com>`).
         */

        match = this.rules.autoLink.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            /*
             * If the second group catched an at-symbol.
             */

            if (match[2] === AT_SIGN) {
                href = text = match[1];

                if (
                    text.substr(0, MAILTO_PROTOCOL.length) !== MAILTO_PROTOCOL
                ) {
                    href = MAILTO_PROTOCOL + text;
                } else {
                    text = text.substr(MAILTO_PROTOCOL.length);
                }
            } else {
                href = text = match[1];
            }

            this.addRawLink(tokens, href, text);

            continue;
        }

        /*
         * A plain URL, without angle/square brackets (GFM).
         */

        if (this.rules.URL && !this.inLink) {
            match = this.rules.URL.exec(value);

            if (match) {
                value = value.substring(match[0].length);

                this.addRawLink(tokens, match[1], match[1]);

                continue;
            }
        }

        /*
         * HTML Tag.
         */

        match = this.rules.tag.exec(value);

        if (match) {
            if (!this.inLink && EXPRESSION_HTML_LINK_OPEN.test(match[0])) {
                this.inLink = true;
            } else if (
                this.inLink &&
                EXPRESSION_HTML_LINK_CLOSE.test(match[0])
            ) {
                this.inLink = false;
            }

            value = value.substring(match[0].length);

            this.addRawToken(tokens, 'html', match[0]);

            continue;
        }

        /*
         * A proper Markdown link.
         */

        match = this.rules.link.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            this.addLink(
                tokens, match[0].charAt(0) !== EXCLAMATION_MARK,
                match[2], match[1], match[3]
            );

            continue;
        }

        /*
         * A reference link (where its attributes are made available through
         * link definitions), or invalid links (only one set of brackets).
         * The latter also catches footnotes.
         */

        match = this.rules.referenceLink.exec(value) ||
            this.rules.invalidLink.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            text = (match[2] || match[1])
                .replace(EXPRESSION_WHITE_SPACES, SPACE);

            if (this.footnotes && text.charAt(0) === CARET) {
                footnote = this.footnotes[text.substr(1)];

                if (footnote) {
                    this.addFootnoteToken(tokens, text.substr(1));

                    continue;
                }
            }

            link = this.links[text.toLowerCase()];

            if (!link || !link.href) {
                if (
                    this.footnotes &&
                    text.charAt(0) === CARET &&
                    text.indexOf(SPACE) > -1
                ) {
                    text = text.substr(1);

                    while (
                        'footnote-' + this.footnoteCounter in this.footnotes
                    ) {
                        ++this.footnoteCounter;
                    }

                    footnote = 'footnote-' + this.footnoteCounter;

                    this.footnotes[footnote] = [{
                        'type': 'paragraph',
                        'children': text
                    }];

                    this.footnotesAsArray.push(footnote);

                    this.addFootnoteToken(tokens, footnote);

                    continue;
                }

                this.addRawToken(tokens, 'text', match[0].charAt(0));

                value = match[0].substring(1) + value;

                continue;
            }

            this.addLink(
                tokens, match[0].charAt(0) !== EXCLAMATION_MARK,
                link.href, match[1], link.title
            );

            continue;
        }

        /*
         * Strong text.
         */

        match = this.rules.strong.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            this.addInlineToken(tokens, 'strong', match[2] || match[1]);

            continue;
        }

        /*
         * Emphasised text.
         */

        match = this.rules.emphasis.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            this.addInlineToken(tokens, 'emphasis', match[2] || match[1]);

            continue;
        }

        /*
         * Inline code.
         */

        match = this.rules.code.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            this.addRawToken(tokens, 'inlineCode', match[2].trimRight());

            continue;
        }

        /*
         * A break.
         */

        match = this.rules.break.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            this.addToken(tokens, 'break');

            continue;
        }

        /*
         * Deleted text (GFM).
         */

        if (
            this.rules.deletion &&
            (match = this.rules.deletion.exec(value))
        ) {
            value = value.substring(match[0].length);

            this.addInlineToken(tokens, 'delete', match[1]);

            continue;
        }

        /*
         * Plain text.
         */

        match = this.rules.text.exec(value);

        /* istanbul ignore else */
        if (match) {
            value = value.substring(match[0].length);

            this.addRawToken(tokens, 'text', match[0]);

            continue;
        }

        /* istanbul ignore next */
        throw new Error(
            'Infinite loop on byte: ' + value.charCodeAt(0)
        );
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
}

/**
 * Static parser.
 *
 * @param {string} value
 * @param {Object?} options
 * @return {Object} a root node.
 */
Parser.parse = function (value, options) {
    var parser,
        footnotes,
        footnotesAsArray,
        footnote,
        index,
        tokens;

    parser = new Parser(options);

    footnotes = value.footnotes;

    parser.inline = new InlineLexer(value.links, footnotes, parser.options);

    tokens = parser.parse(value);

    footnotesAsArray = parser.inline.footnotesAsArray;

    if (footnotes) {
        index = -1;

        while (footnotesAsArray[++index]) {
            footnote = footnotesAsArray[index];
            footnotes[footnote] = parser.parse(footnotes[footnote]);
        }
    }

    return {
        'type': 'root',
        'children': tokens,
        'footnotes': footnotes
    };
};

/**
 * Parse loop.
 *
 * @return {Array.<Object>}
 */
Parser.prototype.parse = function (value) {
    var out;

    this.tokens = value.reverse();

    out = [];

    while (this.next()) {
        out.push(this.tok());
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
 * Tokenize a token.
 *
 * @return {Object}
 */
Parser.prototype.tok = function () {
    var token,
        type,
        children,
        queue,
        cells,
        endToken,
        index,
        cellIterator,
        length,
        cellLength;

    token = this.token;
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
                    this.inline.outputInline(cells[cellIterator].children);
            }
        }

        return token;
    }

    if (type === 'heading' || type === 'paragraph') {
        token.children = this.inline.outputInline(token.children);

        return token;
    }

    if (type === 'blockquote' || type === 'list') {
        children = [];
        endToken = pairMap[type];

        while (this.next().type !== endToken) {
            children = children.concat(this.tok());
        }

        token.children = children;

        return token;
    }

    if (type === 'looseItem' || type === 'listItem') {
        children = [];
        endToken = pairMap[type];

        while (this.next().type !== endToken) {
            queue = this.tok();

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
        return this.inline.outputInline(this.token.value);
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
    var settings,
        lexer;

    settings = utilities.copy({}, defaults);

    if (options) {
        utilities.copy(settings, options);
    }

    lexer = new Lexer(settings);

    return Parser.parse(lexer.lex(value), settings);
}

/*
 * Expose
 */

parse.Parser = Parser;

parse.Lexer = Lexer;

module.exports = parse;
