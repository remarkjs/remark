'use strict';

/**
 * Dependencies.
 */

var he;

he = require('he');

var objectHasOwnProperty, footnoteDefinition, uid,
    gfmCodeFences, gfmParagraph, gfmLooseTable, gfmTable, breaksBreak,
    breaksText, gfmText, gfmDeletion, gfmURL, gfmEscape, pedanticEmphasis,
    breaksGFMText, pedanticStrong;

function cleanExpression(expression) {
    return (expression.source || expression).replace(/(^|[^\[])\^/g, '$1');
}

objectHasOwnProperty = Object.prototype.hasOwnProperty;

function copy(target, context) {
    var key;

    for (key in context) {
        /* istanbul ignore else: hasownproperty */
        if (objectHasOwnProperty.call(context, key)) {
            target[key] = context[key];
        }
    }

    return target;
}
function removeIndent(value) {
    var index,
        minIndent,
        indent,
        values,
        expression;

    values = value.split('\n');

    index = values.length;

    minIndent = Infinity;

    while (index--) {
        if (values[index].length === 0) {
            continue;
        }

        indent = values[index].match(/^ +/);

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

    return values.join('\n');
}

uid = 0;

/**
 * Get a uid;
 */
function getUID(value) {
    uid += 1;
    return value + uid;
}

function getAlignment(rows) {
    var results = [],
        iterator = -1,
        length = rows.length,
        alignment;

    while (++iterator < length) {
        alignment = rows[iterator];

        if (/^ *-+: *$/.test(alignment)) {
            results[iterator] = 'right';
        } else if (/^ *:-+: *$/.test(alignment)) {
            results[iterator] = 'center';
        } else {
            results[iterator] = 'left';
        }
    }

    return results;
}

/**
 * Helpers
 */

var block = {
    'newline' : /^\n+/,
    'bullet' : /(?:[*+-]|\d+\.)/,
    'code' : /^( {4}[^\n]+\n*)+/,
    'horizontalRule' : /^( *[-*_]){3,} *(?:\n+|$)/,
    'heading' : /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
    'lineHeading' : /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
    'linkDefinition' :
        /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
    'text' : /^[^\n]+/
};

block.item = new RegExp(
    '^( *)(' +
        cleanExpression(block.bullet) +
    ') [^\\n]*(?:\\n(?!\\1' +
        cleanExpression(block.bullet) +
    ' )[^\\n]*)*',
'gm');

block.list = new RegExp(
   '^( *)(' +
       cleanExpression(block.bullet) +
   ') [\\s\\S]+?(?:' +

       // Modified Horizontal rule:
       '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))' +
       '|' +

       // Modified Link Definition:
       '\\n+(?=' + cleanExpression(block.linkDefinition) + ')' +

       '|' +
       '\\n{2,}(?! )(?!\\1' +
           cleanExpression(block.bullet) +
       ' )\\n*|' +
       '\\s*$' +
   ')'
);

block.blockquote = new RegExp(
    '^( *>[^\\n]+(\\n(?!' +

    cleanExpression(block.linkDefinition) +

    ')[^\\n]+)*\\n*)+'
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

        // HTML comment.
        cleanExpression('<!--[\\s\\S]*?-->') +
        ' *(?:\\n|\\s*$)|' +

        // Closed tag.
        cleanExpression('<(' + block.tag + ')[\\s\\S]+?<\\/\\1>') +
        ' *(?:\\n{2,}|\\s*$)|' +

        // Closing tag.
        cleanExpression(
            '<' + block.tag + '(?:"[^"]*"|\'[^\']*\'|[^\'">])*?>'
        ) +
        ' *' +
        '(?:\\n{2,}|\\s*$)' +
    ')'
);

block.paragraph = new RegExp(
    '^((' +
        '?:[^\\n]+\\n?(?!' +
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
    ')+)\\n*'
);

/**
 * GFM + Tables Block Grammar
 */

gfmLooseTable =
    /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/;

gfmTable = /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/;

/**
 * GFM Block Grammar
 */

gfmCodeFences = /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/;

gfmParagraph = new RegExp(
    block.paragraph.source.replace('(?!', '(?!' +
        cleanExpression(gfmCodeFences).replace('\\1', '\\2') +
        '|' +
        cleanExpression(block.list).replace('\\1', '\\3') +
        '|'
    )
);

footnoteDefinition = /^ *\[\^([^\]]+)\]: *([^\n]+(\n+ +[^\n]+)*)\n*/;

var defaults = {
    'gfm' : true,
    'tables' : true,
    'footnotes' : false,
    'breaks' : false,
    'pedantic' : false
};

/**
 * Block Lexer
 */

function Lexer(options) {
    var self = this,
        rules;

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
 */

Lexer.prototype.lex = function (value) {
    value = value
        .replace(/\r\n|\r/g, '\n')
        .replace(/\t/g, '        ')
        .replace(/\u00a0/g, ' ')
        .replace(/\u2424/g, '\n');

    return this.token(value, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function (value, top, bq) {
    var tokens,
        token,
        prev,
        loose,
        match,
        bullet,
        otherBullet,
        space,
        iterator,
        length,
        values,
        rowIterator,
        rowLength,
        row;

    value = value.replace(/^ +$/gm, '');
    tokens = this.tokens;

    while (value) {
        /* One or more newline characters. */
        match = this.rules.newline.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            continue;
        }

        match = this.rules.code.exec(value);

        /* Code blocks (with indent), without language. */
        if (match) {
            value = value.substring(match[0].length);

            tokens.push({
                'type' : 'code',
                'lang' : null,
                'value' : removeIndent(match[0]).replace(/\n+$/, '')
            });

            continue;
        }

        /* Fenced code blocks, optionally with language */
        if (this.rules.fences) {
            match = this.rules.fences.exec(value);

            if (match) {
                value = value.substring(match[0].length);

                tokens.push({
                    'type' : 'code',
                    'lang' : match[2] || null,
                    'value' : removeIndent(match[3])
                });

                continue;
            }
        }

        /* Heading suffixed (optionally, affixed) by one to six hashes. */
        match = this.rules.heading.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            tokens.push({
                'type' : 'heading',
                'depth' : match[1].length,
                'children' : match[2]
            });

            continue;
        }

        /* A GFM table, without leading pipes. */
        if (top && this.rules.looseTable) {
            match = this.rules.looseTable.exec(value);

            if (match) {
                value = value.substring(match[0].length);

                token = {
                    'type' : 'table'
                };

                token.align = getAlignment(
                    match[2].replace(/^ *|\| *$/g, '').split(/ *\| */)
                );

                /* Add the table header to table's children. */
                token.children = [{
                    'type' : 'tableHeader',
                    'children' : match[1].replace(/^ *| *\| *$/g, '')
                        .split(/ *\| */)
                }];

                values = match[3].replace(/\n$/, '').split('\n');
                iterator = -1;
                length = values.length;

                /* Add All other rows to table's children. */
                while (++iterator < length) {
                    token.children.push({
                        'type' : 'tableRow',
                        'children' : values[iterator].split(/ *\| */)
                    });
                }

                /* Add table cells in each row (incl. header). */
                values = token.children;
                iterator = -1;
                length = values.length;

                while (++iterator < length) {
                    row = values[iterator].children;
                    rowIterator = -1;
                    rowLength = row.length;

                    while (++rowIterator < rowLength) {
                        row[rowIterator] = {
                            'type' : 'tableCell',
                            'children' : row[rowIterator]
                        };
                    }
                }

                tokens.push(token);

                continue;
            }
        }

        /* Heading followed by a line of equals-symbols or dashes. */
        match = this.rules.lineHeading.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            tokens.push({
                'type' : 'heading',
                'depth' : match[2] === '=' ? 1 : 2,
                'children' : match[1]
            });

            continue;
        }

        /* Horizontal rule: three or more dashes, plusses, or asterisks,
         * optionally with spaces in between. */
        match = this.rules.horizontalRule.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            tokens.push({
                'type' : 'horizontalRule'
            });

            continue;
        }

        /* Blockquote: block level nodes prefixed by greater-than signs. */
        match = this.rules.blockquote.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            prev = tokens[tokens.length - 1];

            if (prev && prev.type === 'blockquoteEnd') {
                this.tokens.pop();
            } else {
                tokens.push({
                    'type' : 'blockquote'
                });
            }

            match = match[0].replace(/^ *> ?/gm, '');

            /* Pass `top` to keep the current 'toplevel' state. This is
             * exactly how markdown.pl works. */
            this.token(match, top, true);

            tokens.push({
                'type' : 'blockquoteEnd'
            });

            continue;
        }

        /* List: mostly just multiple list items, dashes, plusses, asterisks,
         * or numbers. */
        match = this.rules.list.exec(value);

        if (match) {
            value = value.substring(match[0].length);
            bullet = match[2];

            tokens.push({
                'type' : 'list',
                'ordered' : bullet.length > 1
            });

            /* Get each top-level token. */
            match = match[0].match(this.rules.item);

            length = match.length;
            iterator = 0;

            for (; iterator < length; iterator++) {
                token = match[iterator];

                /* Remove the list token's bullet so it is seen as the
                 * next token. */
                space = token.length;
                token = token.replace(/^ *([*+-]|\d+\.) +/, '');

                /* Exdent whatever the list token contains. Hacky. */
                if (token.indexOf('\n ') !== -1) {
                    space -= token.length;

                    token = this.options.pedantic ?
                        token.replace(/^ {1,4}/gm, '') :
                        token.replace(
                            new RegExp('^ {1,' + space + '}', 'gm'),
                            ''
                        );
                }

                /* Determine whether the next list token belongs here.
                 * Backpedal if it does not belong in this list. */
                if (!this.options.pedantic && iterator !== length - 1) {
                    otherBullet = block.bullet.exec(match[iterator + 1])[0];

                    if (
                        bullet !== otherBullet &&
                        !(bullet.length > 1 && otherBullet.length > 1)
                    ) {
                        value = match.slice(iterator + 1).join('\n') + value;
                        iterator = length - 1;
                    }
                }

                /* Determine whether token is loose or not. Use:
                 * /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/ for discount behavior. */
                loose = /\n\n(?!\s*$)/.test(token);

                if (iterator !== length - 1 && !loose) {
                    loose = token.charAt(token.length - 1) === '\n';
                }

                tokens.push({
                    'type' : loose ?
                        'looseItem' :
                        'listItem'
                });

                /* Tokenise the list token. */
                this.token(token, false, bq);

                tokens.push({
                    'type' : 'listItemEnd'
                });
            }

            tokens.push({
                'type' : 'listEnd'
            });

            continue;
        }

        /* Embedded HTML */
        match = this.rules.html.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            prev = tokens[tokens.length - 1];

            if (prev && prev.type === 'html') {
                prev.value += match[0];
            } else {
                tokens.push({
                    'type' : 'html',
                    'value' : match[0]
                });
            }

            continue;
        }

        /* Link definition. */
        if (!bq && top) {
            match = this.rules.linkDefinition.exec(value);

            if (match) {
                value = value.substring(match[0].length);

                tokens.links[match[1].toLowerCase()] = {
                    'type' : null,
                    'href' : match[2],
                    'title' : match[3]
                };

                continue;
            }
        }

        /* Footnote definition. */
        if (!bq && top) {
            if (this.rules.footnoteDefinition) {
                match = this.rules.footnoteDefinition.exec(value);

                if (match) {
                    value = value.substring(match[0].length);

                    iterator = tokens.length;

                    this.token(match[2].replace(/^ {4}/gm, ''), top, true);

                    tokens.footnotes[match[1].toLowerCase()] =
                        tokens.splice(iterator);

                    continue;
                }
            }
        }

        /* Normal table (GFM). */
        if (this.rules.table && top) {
            match = this.rules.table.exec(value);

            if (match) {
                value = value.substring(match[0].length);

                token = {
                    'type' : 'table'
                };

                token.align = getAlignment(
                    match[2].replace(/^ *|\| *$/g, '').split(/ *\| */)
                );

                /* Add the table header to table's children. */
                token.children = [{
                    'type' : 'tableHeader',
                    'children' : match[1].replace(/^ *| *\| *$/g, '')
                        .split(/ *\| */)
                }];

                values = match[3].replace(/(?: *\| *)?\n$/, '').split('\n');
                iterator = -1;
                length = values.length;

                /* Add All other rows to table's children. */
                while (++iterator < length) {
                    token.children.push({
                        'type' : 'tableRow',
                        'children' : values[iterator]
                            .replace(/^ *\| *| *\| *$/g, '').split(/ *\| */)
                    });
                }

                /* Add table cells in each row (incl. header). */
                values = token.children;
                iterator = -1;
                length = values.length;

                while (++iterator < length) {
                    row = values[iterator].children;
                    rowIterator = -1;
                    rowLength = row.length;

                    while (++rowIterator < rowLength) {
                        row[rowIterator] = {
                            'type' : 'tableCell',
                            'children' : row[rowIterator]
                        };
                    }
                }

                tokens.push(token);

                continue;
            }
        }

        /* Paragraph. */
        if (top) {
            match = this.rules.paragraph.exec(value);

            /* istanbul ignore else: Shouldnt reach else. */
            if (match) {
                value = value.substring(match[0].length);

                if (match[1].charAt(match[1].length - 1) === '\n') {
                    match = match[1].slice(0, -1);
                } else {
                    match = match[1];
                }

                tokens.push({
                    'type' : 'paragraph',
                    'children' : match
                });

                continue;
            }
        }

        /* Text */
        match = this.rules.text.exec(value);

        /* istanbul ignore else: Shouldnt reach else. */
        if (match) {
            /* Top-level should never reach here. */
            value = value.substring(match[0].length);

            tokens.push({
                'type' : 'text',
                'value' : he.decode(match[0])
            });

            continue;
        }

        /* istanbul ignore next: Shouldn't reach else. */
        throw new Error('Infinite loop on byte: ' + value.charCodeAt(0));
    }

    return tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
    'escape' : /^\\([\\`*{}\[\]()#+\-.!_>])/,
    'autoLink' : /^<([^ >]+(@|:\/)[^ >]+)>/,
    'tag' : /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
    'invalidLink' : /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
    'strong' : /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
    'emphasis' : /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
    'code' : /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
    'break' : /^ {2,}\n(?!\s*$)/,
    'text' : /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/,
    'inside' : /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/,
    'href' : /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/
};

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

/**
 * Pedantic Inline Grammar
 */

pedanticStrong =
    /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/;

pedanticEmphasis =
    /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/;

/**
 * GFM Inline Grammar
 */

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

/**
 * GFM + Line Breaks Inline Grammar
 */

breaksBreak = new RegExp(inline.break.source.replace('{2,}', '*'));
breaksText = new RegExp(inline.text.source.replace('{2,}', '*'));
breaksGFMText = new RegExp(gfmText.source.replace('{2,}', '*'));

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, footnotes, options) {
    var self = this,
        rules;

    self.options = options;
    self.links = links;
    self.footnotes = footnotes;

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

InlineLexer.prototype.addToken = function (tokens, type) {
    var token = {
        'type' : type
    };

    tokens.push(token);

    return token;
};

InlineLexer.prototype.addInlineToken = function (tokens, type, value) {
    this.addToken(tokens, type).children = this.outputInline(value);
};

InlineLexer.prototype.addRawToken = function (tokens, type, value) {
    var prev = tokens[tokens.length - 1];

    if (type === 'text') {
        value = he.decode(value);
    }

    if (prev && prev.type === type && 'value' in prev) {
        prev.value += value;
    } else {
        this.addToken(tokens, type).value = value;
    }
};

InlineLexer.prototype.addRawLink = function (tokens, href, text, title) {
    var link = this.addToken(tokens, 'link');

    link.title = title || null;

    link.href = href;
    link.children = [];

    this.addRawToken(link.children, 'text', text);
};

InlineLexer.prototype.addLink = function (tokens, isLink, href, text, title) {
    var token = this.addToken(tokens, isLink ? 'link' : 'image');

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

InlineLexer.prototype.addFootnoteToken = function (tokens, id) {
    this.addToken(tokens, 'footnote').id = id;
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.outputInline = function (value) {
    var tokens = [],
        link, footnote, text, href, match;

    while (value) {
        /* Escape character (e.g., `\*\*not strong\*\*`). */
        match = this.rules.escape.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            this.addRawToken(tokens, 'text', match[1]);

            continue;
        }

        /* A link between pointy brackets. (e.g., `<some@thing.com>`). */
        match = this.rules.autoLink.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            /* If the second group catched an at-symbol: */
            if (match[2] === '@') {
                href = text = match[1];

                if (text.substr(0, 7) !== 'mailto:') {
                    href = 'mailto:' + text;
                } else {
                    text = text.substr(7);
                }
            } else {
                href = text = match[1];
            }

            this.addRawLink(tokens, href, text);

            continue;
        }

        /* A plain URL, without angle/square brackets (GFM). */
        if (this.rules.URL && !this.inLink) {
            match = this.rules.URL.exec(value);

            if (match) {
                value = value.substring(match[0].length);

                this.addRawLink(tokens, match[1], match[1]);

                continue;
            }
        }

        /* HTML Tag */
        match = this.rules.tag.exec(value);

        if (match) {
            if (!this.inLink && /^<a /i.test(match[0])) {
                this.inLink = true;
            } else if (this.inLink && /^<\/a>/i.test(match[0])) {
                this.inLink = false;
            }

            value = value.substring(match[0].length);

            this.addRawToken(tokens, 'html', match[0]);

            continue;
        }

        /* A proper Markdown link. */
        match = this.rules.link.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            this.addLink(
                tokens, match[0].charAt(0) !== '!',
                match[2], match[1], match[3]
            );

            continue;
        }

        /* A reference link (where its attributes are made available through
         * link definitions), or invalid links (only one set of brackets).
         * The latter also catches footnotes. */
        match = this.rules.referenceLink.exec(value) ||
            this.rules.invalidLink.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            text = (match[2] || match[1]).replace(/\s+/g, ' ');

            if (this.footnotes && text.charAt(0) === '^') {
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
                    text.charAt(0) === '^' &&
                    text.indexOf(' ') > -1
                ) {
                    text = text.substr(1);
                    footnote = getUID('footnote-');

                    this.footnotes[footnote] = [{
                        'type' : 'paragraph',
                        'children' : text
                    }];

                    this.addFootnoteToken(tokens, footnote);

                    continue;
                }

                this.addRawToken(tokens, 'text', match[0].charAt(0));

                value = match[0].substring(1) + value;

                continue;
            }

            this.addLink(
                tokens, match[0].charAt(0) !== '!',
                link.href, match[1], link.title
            );

            continue;
        }

        /* Strong text. */
        match = this.rules.strong.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            this.addInlineToken(tokens, 'strong', match[2] || match[1]);

            continue;
        }

        /* Emphasised text. */
        match = this.rules.emphasis.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            this.addInlineToken(tokens, 'emphasis', match[2] || match[1]);

            continue;
        }

        /* Inline code. */
        match = this.rules.code.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            this.addRawToken(tokens, 'inlineCode', match[2].trimRight());

            continue;
        }

        /* A break. */
        match = this.rules.break.exec(value);

        if (match) {
            value = value.substring(match[0].length);

            this.addToken(tokens, 'break');

            continue;
        }

        /* Deleted text (GFM) */
        if (
            this.rules.deletion &&
            (match = this.rules.deletion.exec(value))
        ) {
            value = value.substring(match[0].length);

            this.addInlineToken(tokens, 'delete', match[1]);

            continue;
        }

        /* Plain text. */
        match = this.rules.text.exec(value);

        /* istanbul ignore else: Shouldn't reach else. */
        if (match) {
            value = value.substring(match[0].length);

            this.addRawToken(tokens, 'text', match[0]);

            continue;
        }

        /* istanbul ignore next: Shouldn't reach else. */
        throw new Error('Infinite loop on byte: ' + value.charCodeAt(0));
    }

    return tokens;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
    var self = this;

    self.tokens = [];
    self.token = null;
    self.options = options;
}

/**
 * Static Parse Method
 */
Parser.parse = function (value, options) {
    var parser = new Parser(options),
        footnotes = value.footnotes,
        footnote, tokens;

    parser.inline = new InlineLexer(value.links, footnotes, parser.options);

    tokens = parser.parse(value);

    if (footnotes) {
        for (footnote in footnotes) {
            /* istanbul ignore else: hasownproperty */
            if (objectHasOwnProperty.call(footnotes, footnote)) {
                footnotes[footnote] = parser.parse(footnotes[footnote]);
            }
        }
    }

    return {
        'type' : 'root',
        'children' : tokens,
        'footnotes' : footnotes
    };
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function (value) {
    this.tokens = value.reverse();

    var out = [];
    while (this.next()) {
        out.push(this.tok());
    }

    return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function () {
    this.token = this.tokens.pop();
    return this.token;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function () {
    var self = this,
        tokens = self.tokens,
        body = self.token.value;

    while (tokens[tokens.length - 1].type === 'text') {
        body += '\n' + self.next().value;
    }

    return self.inline.outputInline(body);
};

/**
 * Parse Current Token
 */

var pairMap = {
    'blockquote' : 'blockquoteEnd',
    'list' : 'listEnd',
    'looseItem' : 'listItemEnd',
    'listItem' : 'listItemEnd'
};

Parser.prototype.tok = function () {
    var token = this.token,
        type = token.type,
        children,
        queue,
        cells,
        endToken,
        iterator,
        cellIterator,
        length,
        cellLength;

    if (
        type === 'horizontalRule' ||
        type === 'code' ||
        type === 'inlineCode' ||
        type === 'html'
    ) {
        return token;
    }

    if (type === 'table') {
        iterator = -1;
        children = token.children;
        length = children.length;

        while (++iterator < length) {
            cellIterator = -1;
            cells = children[iterator].children;
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
                    'type' : 'paragraph',
                    'children' : queue
                };
            }

            children.push(queue);
        }

        token.type = 'listItem';
        token.loose = type === 'looseItem';
        token.children = children;

        return token;
    }

    /* istanbul ignore else: Shouldn't reach else. */
    if (type === 'text') {
        return this.parseText();
    }

    /* istanbul ignore next: Shouldn't reach else. */
    return token;
};

/**
 * Marked
 */

function parse(value, options) {
    var settings = copy({}, defaults);

    if (options) {
        copy(settings, options);
    }

    var lexer = new Lexer(settings);
    return Parser.parse(lexer.lex(value), settings);
}

/**
 * Expose
 */

parse.Parser = Parser;

parse.Lexer = Lexer;

module.exports = parse;
