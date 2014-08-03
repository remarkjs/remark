'use strict';

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

uid = 0;

/**
 * Get a uid;
 */
function getUID(value) {
    uid += 1;
    return value + uid;
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

var mdastDefaults = {
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
    this.tokens = [];
    this.tokens.links = {};
    this.tokens.footnotes = null;
    this.options = options;
    this.rules = copy({}, block);

    if (this.options.gfm) {
        this.rules.paragraph = gfmParagraph;
        this.rules.fences = gfmCodeFences;

        if (this.options.tables) {
            this.rules.table = gfmTable;
            this.rules.looseTable = gfmLooseTable;
        }
    }

    if (this.options.footnotes) {
        this.tokens.footnotes = {};
        this.rules.footnoteDefinition = footnoteDefinition;
    }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function (value, options) {
    var lexer = new Lexer(options);
    return lexer.lex(value);
};

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
    var tokens, next, prev, loose, cap, bullet, b, item, space, i, l;

    value = value.replace(/^ +$/gm, '');
    tokens = this.tokens;

    /* eslint-disable no-cond-assign */
    while (value) {
        /* One or more newline characters. */
        if (cap = this.rules.newline.exec(value)) {
            value = value.substring(cap[0].length);
        }

        /* Code blocks (with indent), without language. */
        if (cap = this.rules.code.exec(value)) {
            value = value.substring(cap[0].length);
            cap = cap[0].replace(/^ {4}/gm, '');
            tokens.push({
                'type' : 'code',
                'value' : this.options.pedantic ?
                    cap :
                    cap.replace(/\n+$/, '')
            });
            continue;
        }

        /* Fenced code blocks, optionally with language */
        if (this.rules.fences && (cap = this.rules.fences.exec(value))) {
            value = value.substring(cap[0].length);
            tokens.push({
                'type' : 'code',
                'lang' : cap[2] || null,
                'value' : cap[3]
            });
            continue;
        }

        /* Heading suffixed (and optionally, affixed) by one to six hashes.
         * */
        if (cap = this.rules.heading.exec(value)) {
            value = value.substring(cap[0].length);
            tokens.push({
                'type' : 'heading',
                'depth' : cap[1].length,
                'children' : cap[2]
            });
            continue;
        }

        /* A GFM table, without leading pipes. */
        if (
            this.rules.looseTable && top &&
            (cap = this.rules.looseTable.exec(value))
        ) {
            value = value.substring(cap[0].length);

            item = {
                'type' : 'table',
                'header' :
                    cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
                'align' : cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
                'rows' : cap[3].replace(/\n$/, '').split('\n')
            };

            for (i = 0; i < item.align.length; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                    item.align[i] = 'right';
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                    item.align[i] = 'center';
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                    item.align[i] = 'left';
                } else {
                    item.align[i] = null;
                }
            }

            for (i = 0; i < item.rows.length; i++) {
                item.rows[i] = item.rows[i].split(/ *\| */);
            }

            tokens.push(item);

            continue;
        }

        /* Heading followed by a line of equals-symbols or dashes. */
        if (cap = this.rules.lineHeading.exec(value)) {
            value = value.substring(cap[0].length);
            tokens.push({
                'type' : 'heading',
                'depth' : cap[2] === '=' ? 1 : 2,
                'children' : cap[1]
            });
            continue;
        }

        /* Horizontal rule: three or more dashes, plusses, or asterisks,
         * optionally with spaces in between. */
        if (cap = this.rules.horizontalRule.exec(value)) {
            value = value.substring(cap[0].length);
            tokens.push({
                'type' : 'horizontalRule'
            });
            continue;
        }

        /* Blockquote: block level nodes prefixed by greater-than signs. */
        if (cap = this.rules.blockquote.exec(value)) {
            value = value.substring(cap[0].length);

            tokens.push({
                'type' : 'blockquote'
            });

            cap = cap[0].replace(/^ *> ?/gm, '');

            /* Pass `top` to keep the current 'toplevel' state. This is
             * exactly how markdown.pl works. */
            this.token(cap, top, true);

            tokens.push({
                'type' : 'blockquoteEnd'
            });

            continue;
        }

        /* List: mostly just multiple list items, dashes, plusses, asterisks,
         * or numbers. */
        if (cap = this.rules.list.exec(value)) {
            value = value.substring(cap[0].length);
            bullet = cap[2];

            tokens.push({
                'type' : 'list',
                'ordered' : bullet.length > 1
            });

            /* Get each top-level item. */
            cap = cap[0].match(this.rules.item);

            next = false;
            l = cap.length;
            i = 0;

            for (; i < l; i++) {
                item = cap[i];

                /* Remove the list item's bullet so it is seen as the
                 * next token. */
                space = item.length;
                item = item.replace(/^ *([*+-]|\d+\.) +/, '');

                /* Exdent whatever the list item contains. Hacky. */
                if (item.indexOf('\n ') !== -1) {
                    space -= item.length;

                    item = this.options.pedantic ?
                        item.replace(/^ {1,4}/gm, '') :
                        item.replace(
                            new RegExp('^ {1,' + space + '}', 'gm'),
                            ''
                        );
                }

                /* Determine whether the next list item belongs here.
                 * Backpedal if it does not belong in this list. */
                if (!this.options.pedantic && i !== l - 1) {
                    b = block.bullet.exec(cap[i + 1])[0];
                    if (
                        bullet !== b &&
                        !(bullet.length > 1 && b.length > 1)
                    ) {
                        value = cap.slice(i + 1).join('\n') + value;
                        i = l - 1;
                    }
                }

                /* Determine whether item is loose or not. Use:
                 * /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/ for discount behavior. */
                loose = next || /\n\n(?!\s*$)/.test(item);
                if (i !== l - 1) {
                    next = item.charAt(item.length - 1) === '\n';
                    if (!loose) {
                        loose = next;
                    }
                }

                tokens.push({
                    'type' : loose ?
                        'looseItem' :
                        'listItem'
                });

                /* Tokenise the list item. */
                this.token(item, false, bq);

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
        if (cap = this.rules.html.exec(value)) {
            value = value.substring(cap[0].length);

            prev = tokens[tokens.length - 1];

            if (prev && prev.type === 'html') {
                prev.value += cap[0];
            } else {
                tokens.push({
                    'type' : 'html',
                    'value' : cap[0]
                });
            }

            continue;
        }

        /* Link definition. */
        if ((!bq && top) && (cap = this.rules.linkDefinition.exec(value))) {
            value = value.substring(cap[0].length);
            tokens.links[cap[1].toLowerCase()] = {
                'type' : null,
                'href' : cap[2],
                'title' : cap[3]
            };
            continue;
        }

        /* Footnote definition. */
        if (
            this.rules.footnoteDefinition && !bq && top &&
            (cap = this.rules.footnoteDefinition.exec(value))
        ) {
            value = value.substring(cap[0].length);

            i = tokens.length;

            this.token(cap[2].replace(/^ {4}/gm, ''), top, true);

            tokens.footnotes[cap[1].toLowerCase()] =
                tokens.splice(i);

            continue;
        }

        /* Normal table (GFM). */
        if (this.rules.table && top && (cap = this.rules.table.exec(value))) {
            value = value.substring(cap[0].length);

            item = {
                'type' : 'table',
                'header' :
                    cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
                'align' :
                    cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
                'rows' :
                    cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
            };

            for (i = 0; i < item.align.length; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                    item.align[i] = 'right';
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                    item.align[i] = 'center';
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                    item.align[i] = 'left';
                } else {
                    item.align[i] = null;
                }
            }

            for (i = 0; i < item.rows.length; i++) {
                item.rows[i] = item.rows[i]
                    .replace(/^ *\| *| *\| *$/g, '')
                    .split(/ *\| */);
            }

            tokens.push(item);

            continue;
        }

        /* Paragraph. */
        if (top && (cap = this.rules.paragraph.exec(value))) {
            value = value.substring(cap[0].length);
            tokens.push({
                'type' : 'paragraph',
                'children' : cap[1].charAt(cap[1].length - 1) === '\n' ?
                    cap[1].slice(0, -1) :
                    cap[1]
            });
            continue;
        }

        /* Text */
        if (cap = this.rules.text.exec(value)) {
            /* Top-level should never reach here. */
            value = value.substring(cap[0].length);
            tokens.push({
                'type' : 'text',
                'value' : cap[0]
            });
            continue;
        }

        /* istanbul ignore if: Shouldnt reach here. */
        if (value) {
            throw new Error('Infinite loop on byte: ' + value.charCodeAt(0));
        }
    }
    /* eslint-enable no-cond-assign */

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
    this.options = options;
    this.links = links;
    this.footnotes = footnotes;
    this.rules = copy({}, inline);

    if (this.options.breaks) {
        this.rules.break = breaksBreak;
        this.rules.text = breaksText;
    }

    if (this.options.gfm) {
        this.rules.text = gfmText;
        this.rules.deletion = gfmDeletion;
        this.rules.URL = gfmURL;
        this.rules.escape = gfmEscape;

        if (this.options.breaks) {
            this.rules.text = breaksGFMText;
        }
    }

    if (this.options.pedantic) {
        this.rules.strong = pedanticStrong;
        this.rules.emphasis = pedanticEmphasis;
    }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function (value) {
    var tokens = [],
        link, footnote, text, href, cap, prev;

    /* eslint-disable no-cond-assign */
    while (value) {
        /* Escape character (e.g., `\*\*not strong\*\*`). */
        cap = this.rules.escape.exec(value);

        if (cap) {
            value = value.substring(cap[0].length);

            prev = tokens[tokens.length - 1];

            if (prev && prev.type === 'text') {
                prev.value += cap[1];
            } else {
                tokens.push({
                    'type' : 'text',
                    'value' : cap[1]
                });
            }

            continue;
        }

        /* A link between pointy brackets. (e.g., `<some@thing.com>`). */
        cap = this.rules.autoLink.exec(value);

        if (cap) {
            value = value.substring(cap[0].length);

            /* If the second group catched an at-symbol: */
            if (cap[2] === '@') {
                href = text = cap[1];

                if (text.substr(0, 7) !== 'mailto:') {
                    href = 'mailto:' + text;
                } else {
                    text = text.substr(7);
                }
            } else {
                href = text = cap[1];
            }

            tokens.push({
                'type' : 'link',
                'href' : href,
                'children' : [{
                    'type' : 'text',
                    'value' : text
                }],
                'title' : null
            });

            continue;
        }

        /* A plain URL, without angle/square brackets (GFM). */
        if (
            this.rules.URL && !this.inLink &&
            (cap = this.rules.URL.exec(value))
        ) {
            value = value.substring(cap[0].length);

            tokens.push({
                'type' : 'link',
                'href' : cap[1],
                'children' : [{
                    'type' : 'text',
                    'value' : cap[1]
                }],
                'title' : null
            });

            continue;
        }

        /* HTML Tag */
        if (cap = this.rules.tag.exec(value)) {
            if (!this.inLink && /^<a /i.test(cap[0])) {
                this.inLink = true;
            } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
                this.inLink = false;
            }
            value = value.substring(cap[0].length);

            tokens.push({
                'type' : 'html',
                'value' : cap[0]
            });

            continue;
        }

        /* A proper Markdown link. */
        if (cap = this.rules.link.exec(value)) {
            value = value.substring(cap[0].length);
            this.inLink = true;

            tokens.push(this.outputLink(cap, cap[2], {
                'type' : null,
                'title' : cap[3]
            }));

            this.inLink = false;
            continue;
        }

        /* A reference link (where its attributes are made available through
         * link definitions), or invalid links (only one set of brackets).
         * The latter also catches footnotes. */
        if (
            (cap = this.rules.referenceLink.exec(value)) ||
            (cap = this.rules.invalidLink.exec(value))
        ) {
            value = value.substring(cap[0].length);
            text = (cap[2] || cap[1]).replace(/\s+/g, ' ');

            if (this.footnotes && text.charAt(0) === '^') {
                footnote = this.footnotes[text.substr(1)];

                if (footnote) {
                    tokens.push({
                        'type' : 'footnote',
                        'id' : text.substr(1)
                    });
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

                    tokens.push({
                        'type' : 'footnote',
                        'id' : footnote
                    });

                    continue;
                }

                prev = tokens[tokens.length - 1];

                if (prev && prev.type === 'text') {
                    prev.value += cap[0].charAt(0);
                } else {
                    tokens.push({
                        'type' : 'text',
                        'value' : cap[0].charAt(0)
                    });
                }

                value = cap[0].substring(1) + value;

                continue;
            }

            this.inLink = true;

            tokens.push(this.outputLink(cap, link.href, link));

            this.inLink = false;
            continue;
        }

        /* Strong text. */
        cap = this.rules.strong.exec(value);

        if (cap) {
            value = value.substring(cap[0].length);

            tokens.push({
                'type' : 'strong',
                'children' : this.output(cap[2] || cap[1])
            });

            continue;
        }

        /* Emphasised text. */
        if (cap = this.rules.emphasis.exec(value)) {
            value = value.substring(cap[0].length);

            tokens.push({
                'type' : 'emphasis',
                'children' : this.output(cap[2] || cap[1])
            });

            continue;
        }

        /* Inline code. */
        if (cap = this.rules.code.exec(value)) {
            value = value.substring(cap[0].length);

            tokens.push({
                'type' : 'code',
                'value' : cap[2]
            });

            continue;
        }

        /* A break. */
        if (cap = this.rules.break.exec(value)) {
            value = value.substring(cap[0].length);

            tokens.push({
                'type' : 'break'
            });

            continue;
        }

        /* Deleted text (GFM) */
        if (
            this.rules.deletion &&
            (cap = this.rules.deletion.exec(value))
        ) {
            value = value.substring(cap[0].length);

            tokens.push({
                'type' : 'delete',
                'children' : this.output(cap[1])
            });

            continue;
        }

        /* Plain text. */
        /* istanbul ignore else: Shouldn't reach else. */
        if (cap = this.rules.text.exec(value)) {
            value = value.substring(cap[0].length);

            prev = tokens[tokens.length - 1];

            if (prev && prev.type === 'text') {
                prev.value += cap[0];
            } else {
                tokens.push({
                    'type' : 'text',
                    'value' : cap[0]
                });
            }

            continue;
        }

        /* istanbul ignore next: Shouldn't reach else. */
        throw new Error('Infinite loop on byte: ' + value.charCodeAt(0));
    }
    /* eslint-enable no-cond-assign */

    return tokens;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function (cap, href, link) {
    if (!link.title) {
        link.title = null;
    }

    if (cap[0].charAt(0) !== '!') {
        link.type = 'link';
        link.href = href;
        link.children = this.output(cap[1]);
    } else {
        link.type = 'image';
        link.src = href;
        link.alt = cap[1] || null;
    }

    return link;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
    this.tokens = [];
    this.token = null;
    this.options = options;
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
            footnotes[footnote] = parser.parse(footnotes[footnote]);
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
        body += '\n' + self.next().children;
    }

    return self.inline.output(body);
};

/**
 * Parse Current Token
 */

var pairMap = {
    'blockquote' : 'blockquoteEnd',
    'list' : 'listEnd',
    'looseItem' : 'listItemEnd'
};

Parser.prototype.tok = function () {
    var token = this.token,
        type = token.type,
        children, columns, endToken, iterator, columnIterator, length,
        columnLength;

    if (type === 'horizontalRule' || type === 'code' || type === 'html') {
        return token;
    }

    if (type === 'table') {
        iterator = -1;
        children = token.header;
        length = children.length;

        while (++iterator < length) {
            children[iterator] = this.inline.output(children[iterator]);
        }

        iterator = -1;
        children = token.rows;
        length = children.length;

        while (++iterator < length) {
            columnIterator = -1;
            columns = children[iterator];
            columnLength = columns.length;

            while (++columnIterator < columnLength) {
                columns[columnIterator] =
                    this.inline.output(columns[columnIterator]);
            }
        }

        return token;
    }

    if (type === 'heading' || type === 'paragraph') {
        token.children = this.inline.output(token.children);

        return token;
    }

    if (type === 'blockquote' || type === 'list' || type === 'looseItem') {
        children = [];
        endToken = pairMap[type];

        while (this.next().type !== endToken) {
            children = children.concat(this.tok());
        }

        token.children = children;

        if (type === 'looseItem') {
            token.type = 'listItem';
        }

        return token;
    }

    if (type === 'listItem') {
        children = [];

        while (this.next().type !== 'listItemEnd') {
            if (this.token.type === 'text') {
                children = children.concat(children, this.parseText());
            } else {
                children = children.concat(this.tok());
            }
        }

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

function mdast(value, options) {
    var settings = copy({}, mdastDefaults);

    if (options) {
        copy(settings, options);
    }

    var tokens = Lexer.lex(value, settings);

    return Parser.parse(tokens, settings);
}

/**
 * Expose
 */

mdast.Parser = Parser;

mdast.Lexer = Lexer;

module.exports = mdast;
