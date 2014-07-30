'use strict';

/**
 * Block-Level Grammar
 */

/* istanbul ignore next: noop */
function noop() {}

var objectHasOwnProperty, noopExpression, footnoteDefinition, uid;

noopExpression = {
    'exec' : noop
};

function replace(regex, opt) {
    regex = regex.source;
    opt = opt || '';

    function self(name, val) {
        if (!name) {
            return new RegExp(regex, opt);
        }

        val = val.source || val;
        val = val.replace(/(^|[^\[])\^/g, '$1');
        regex = regex.replace(name, val);

        return self;
    }

    return self;
}

objectHasOwnProperty = Object.prototype.hasOwnProperty;

function merge(context) {
    var iterator = 0,
        length = arguments.length,
        target, key;

    while (++iterator < length) {
        target = arguments[iterator];

        for (key in target) {
            /* istanbul ignore else: hasownproperty */
            if (objectHasOwnProperty.call(target, key)) {
                context[key] = target[key];
            }
        }
    }

    return context;
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
    'code' : /^( {4}[^\n]+\n*)+/,
    'fences' : noopExpression,
    'horizontalRule' : /^( *[-*_]){3,} *(?:\n+|$)/,
    'heading' : /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
    'looseTable' : noopExpression,
    'lineHeading' : /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
    'blockquote' : /^( *>[^\n]+(\n(?!linkDefinition)[^\n]+)*\n*)+/,
    'list' : new RegExp(
        '^( *)(bullet) [\\s\\S]+?(?:' +
            'horizontalRule|' +
            'linkDefinition|' +
            '\\n{2,}(?! )(?!\\1bullet )\\n*|' +
            '\\s*$' +
        ')'
    ),
    'html' : new RegExp(
        '^ *(?:comment *(?:\\n|\\s*$)|' +
        'closed *(?:\\n{2,}|\\s*$)|' +
        'closing *(?:\\n{2,}|\\s*$))'
    ),
    'linkDefinition' :
        /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
    'footnoteDefinition' : noopExpression,
    'table' : noopExpression,
    'paragraph' : new RegExp(
        '^((' +
            '?:[^\\n]+\\n?(?!' +
                'horizontalRule|heading|lineHeading|blockquote|' +
                'tag|linkDefinition' +
            ')' +
        ')+)\\n*'
    ),
    'text' : /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bullet) [^\n]*(?:\n(?!\1bullet )[^\n]*)*/;
block.item = replace(block.item, 'gm')
    (/bullet/g, block.bullet)
    ();

block.list = replace(block.list)
    (/bullet/g, block.bullet)
    ('horizontalRule', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
    ('linkDefinition', '\\n+(?=' + block.linkDefinition.source + ')')
    ();

block.blockquote = replace(block.blockquote)
    ('linkDefinition', block.linkDefinition)
    ();

block.tag = '(?!' +
        '(?:' +
            'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|' +
            'var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|' +
            'span|br|wbr|ins|del|img' +
        ')\\b' +
    ')' +
    '\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
    ('comment', /<!--[\s\S]*?-->/)
    ('closed', /<(tag)[\s\S]+?<\/\1>/)
    ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
    (/tag/g, block.tag)
    ();

block.paragraph = replace(block.paragraph)
    ('horizontalRule', block.horizontalRule)
    ('heading', block.heading)
    ('lineHeading', block.lineHeading)
    ('blockquote', block.blockquote)
    ('tag', '<' + block.tag)
    ('linkDefinition', block.linkDefinition)
    ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
    'fences' : /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
    'paragraph' : /^/
});

block.gfm.paragraph = replace(block.paragraph)
    (
        '(?!', '(?!' +
        block.gfm.fences.source.replace('\\1', '\\2') +
        '|' +
        block.list.source.replace('\\1', '\\3') +
        '|'
    )();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
    'looseTable' :
        /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
    'table' : /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

footnoteDefinition = /^ *\[\^([^\]]+)\]: *([^\n]+(\n+ +[^\n]+)*)\n*/;

var markedDefaults = {
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
    this.options = options || markedDefaults;
    this.rules = block.normal;

    if (this.options.gfm) {
        if (this.options.tables) {
            this.rules = block.tables;
        } else {
            this.rules = block.gfm;
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
    var next, loose, cap, bullet, b, item, space, i, l;

    value = value.replace(/^ +$/gm, '');

    /* eslint-disable no-cond-assign */
    while (value) {
        // newline
        if (cap = this.rules.newline.exec(value)) {
            value = value.substring(cap[0].length);
        }

        // code
        if (cap = this.rules.code.exec(value)) {
            value = value.substring(cap[0].length);
            cap = cap[0].replace(/^ {4}/gm, '');
            this.tokens.push({
                'type' : 'code',
                'value' : this.options.pedantic ?
                    cap :
                    cap.replace(/\n+$/, '')
            });
            continue;
        }

        // fences (gfm)
        if (cap = this.rules.fences.exec(value)) {
            value = value.substring(cap[0].length);
            this.tokens.push({
                'type' : 'code',
                'lang' : cap[2] || null,
                'value' : cap[3]
            });
            continue;
        }

        // heading
        if (cap = this.rules.heading.exec(value)) {
            value = value.substring(cap[0].length);
            this.tokens.push({
                'type' : 'heading',
                'depth' : cap[1].length,
                'children' : cap[2]
            });
            continue;
        }

        // table no leading pipe (gfm)
        if (top && (cap = this.rules.looseTable.exec(value))) {
            value = value.substring(cap[0].length);

            item = {
                'type' : 'table',
                'header' :
                    cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
                'align' : cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
                'cells' : cap[3].replace(/\n$/, '').split('\n')
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

            for (i = 0; i < item.cells.length; i++) {
                item.cells[i] = item.cells[i].split(/ *\| */);
            }

            this.tokens.push(item);

            continue;
        }

        // lineHeading
        if (cap = this.rules.lineHeading.exec(value)) {
            value = value.substring(cap[0].length);
            this.tokens.push({
                'type' : 'heading',
                'depth' : cap[2] === '=' ? 1 : 2,
                'children' : cap[1]
            });
            continue;
        }

        // horizontalRule
        if (cap = this.rules.horizontalRule.exec(value)) {
            value = value.substring(cap[0].length);
            this.tokens.push({
                'type' : 'horizontalRule'
            });
            continue;
        }

        // blockquote
        if (cap = this.rules.blockquote.exec(value)) {
            value = value.substring(cap[0].length);

            this.tokens.push({
                'type' : 'blockquote'
            });

            cap = cap[0].replace(/^ *> ?/gm, '');

            // Pass `top` to keep the current
            // 'toplevel' state. This is exactly
            // how markdown.pl works.
            this.token(cap, top, true);

            this.tokens.push({
                'type' : 'blockquoteEnd'
            });

            continue;
        }

        // list
        if (cap = this.rules.list.exec(value)) {
            value = value.substring(cap[0].length);
            bullet = cap[2];

            this.tokens.push({
                'type' : 'list',
                'ordered' : bullet.length > 1
            });

            // Get each top-level item.
            cap = cap[0].match(this.rules.item);

            next = false;
            l = cap.length;
            i = 0;

            for (; i < l; i++) {
                item = cap[i];

                // Remove the list item's bullet
                // so it is seen as the next token.
                space = item.length;
                item = item.replace(/^ *([*+-]|\d+\.) +/, '');

                // Outdent whatever the
                // list item contains. Hacky.
                if (item.indexOf('\n ') !== -1) {
                    space -= item.length;

                    item = this.options.pedantic ?
                        item.replace(/^ {1,4}/gm, '') :
                        item.replace(
                            new RegExp('^ {1,' + space + '}', 'gm'),
                            ''
                        );
                }

                // Determine whether the next list item belongs here.
                // Backpedal if it does not belong in this list.
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

                // Determine whether item is loose or not.
                // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
                // for discount behavior.
                loose = next || /\n\n(?!\s*$)/.test(item);
                if (i !== l - 1) {
                    next = item.charAt(item.length - 1) === '\n';
                    if (!loose) {
                        loose = next;
                    }
                }

                this.tokens.push({
                    'type' : loose ?
                        'looseItem' :
                        'listItem'
                });

                // Recurse.
                this.token(item, false, bq);

                this.tokens.push({
                    'type' : 'listItemEnd'
                });
            }

            this.tokens.push({
                'type' : 'listEnd'
            });

            continue;
        }

        // html
        if (cap = this.rules.html.exec(value)) {
            value = value.substring(cap[0].length);
            this.tokens.push({
                'type' : 'html',
                'value' : cap[0]
            });
            continue;
        }

        // linkDefinition
        if ((!bq && top) && (cap = this.rules.linkDefinition.exec(value))) {
            value = value.substring(cap[0].length);
            this.tokens.links[cap[1].toLowerCase()] = {
                'href' : cap[2],
                'title' : cap[3]
            };
            continue;
        }

        // footnoteDefinition
        if (
            this.options.footnotes && !bq && top &&
            (cap = this.rules.footnoteDefinition.exec(value))
        ) {
            value = value.substring(cap[0].length);

            i = this.tokens.length;

            this.token(cap[2].replace(/^ {4}/gm, ''), top, true);

            this.tokens.footnotes[cap[1].toLowerCase()] =
                this.tokens.splice(i);

            continue;
        }

        // table (gfm)
        if (top && (cap = this.rules.table.exec(value))) {
            value = value.substring(cap[0].length);

            item = {
                'type' : 'table',
                'header' :
                    cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
                'align' :
                    cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
                'cells' :
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

            for (i = 0; i < item.cells.length; i++) {
                item.cells[i] = item.cells[i]
                    .replace(/^ *\| *| *\| *$/g, '')
                    .split(/ *\| */);
            }

            this.tokens.push(item);

            continue;
        }

        // top-level paragraph
        if (top && (cap = this.rules.paragraph.exec(value))) {
            value = value.substring(cap[0].length);
            this.tokens.push({
                'type' : 'paragraph',
                'children' : cap[1].charAt(cap[1].length - 1) === '\n' ?
                    cap[1].slice(0, -1) :
                    cap[1]
            });
            continue;
        }

        // text
        if (cap = this.rules.text.exec(value)) {
            // Top-level should never reach here.
            value = value.substring(cap[0].length);
            this.tokens.push({
                'type' : 'text',
                'value' : cap[0]
            });
            continue;
        }

        /* istanbul ignore if: Shouldnt reach here. */
        if (value) {
            throw new
                Error('Infinite loop on byte: ' + value.charCodeAt(0));
        }
    }
    /* eslint-enable no-cond-assign */

    return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
    'escape' : /^\\([\\`*{}\[\]()#+\-.!_>])/,
    'autoLink' : /^<([^ >]+(@|:\/)[^ >]+)>/,
    'URL' : noopExpression,
    'tag' : /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
    'link' : /^!?\[(inside)\]\(href\)/,
    'referenceLink' : /^!?\[(inside)\]\s*\[([^\]]*)\]/,
    'invalidLink' : /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
    'strong' : /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
    'emphasis' : /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
    'code' : /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
    'break' : /^ {2,}\n(?!\s*$)/,
    'deletion' : noopExpression,
    'text' : /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline.inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline.href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
    ('inside', inline.inside)
    ('href', inline.href)
    ();

inline.referenceLink = replace(inline.referenceLink)
    ('inside', inline.inside)
    ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
    'strong' :
        /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
    'emphasis' :
        /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
    'escape' : replace(inline.escape)('])', '~|])')(),
    'URL' : /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
    'deletion' : /^~~(?=\S)([\s\S]*?\S)~~/,
    'text' : replace(inline.text)
        (']|', '~]|')
        ('|', '|https?://|')
        ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
    'break' : replace(inline.break)('{2,}', '*')(),
    'text' : replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, footnotes, options) {
    this.options = options;
    this.links = links;
    this.footnotes = footnotes;
    this.rules = inline.normal;

    if (this.options.gfm) {
        if (this.options.breaks) {
            this.rules = inline.breaks;
        } else {
            this.rules = inline.gfm;
        }
    } else if (this.options.pedantic) {
        this.rules = inline.pedantic;
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
        /* escape */
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

        /* autoLink */
        cap = this.rules.autoLink.exec(value);

        if (cap) {
            value = value.substring(cap[0].length);

            /* If the second group catched an at-symbol: */
            if (cap[2] === '@') {
                text = cap[1].charAt(6) === ':' ?
                    cap[1].substring(7) :
                    cap[1];
                href = 'mailto:' + text;
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

        // URL (gfm)
        if (!this.inLink && (cap = this.rules.URL.exec(value))) {
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

        // tag
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

        // link
        if (cap = this.rules.link.exec(value)) {
            value = value.substring(cap[0].length);
            this.inLink = true;

            tokens.push(this.outputLink(cap, {
                'href' : cap[2],
                'title' : cap[3]
            }));

            this.inLink = false;
            continue;
        }

        // referenceLink, invalidLink
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

            tokens.push(this.outputLink(cap, link));

            this.inLink = false;
            continue;
        }

        // strong
        cap = this.rules.strong.exec(value);

        if (cap) {
            value = value.substring(cap[0].length);

            tokens.push({
                'type' : 'strong',
                'children' : this.output(cap[2] || cap[1])
            });

            continue;
        }

        // emphasis
        if (cap = this.rules.emphasis.exec(value)) {
            value = value.substring(cap[0].length);

            tokens.push({
                'type' : 'emphasis',
                'children' : this.output(cap[2] || cap[1])
            });

            continue;
        }

        // Inline code
        if (cap = this.rules.code.exec(value)) {
            value = value.substring(cap[0].length);

            tokens.push({
                'type' : 'code',
                'value' : cap[2]
            });

            continue;
        }

        // break
        if (cap = this.rules.break.exec(value)) {
            value = value.substring(cap[0].length);

            tokens.push({
                'type' : 'break'
            });

            continue;
        }

        // deletion (gfm)
        if (cap = this.rules.deletion.exec(value)) {
            value = value.substring(cap[0].length);

            tokens.push({
                'type' : 'delete',
                'children' : this.output(cap[1])
            });

            continue;
        }

        // text
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

InlineLexer.prototype.outputLink = function (cap, link) {
    if (!link.title) {
        link.title = null;
    }

    if (cap[0].charAt(0) !== '!') {
        link.children = this.output(cap[1]);
        link.type = 'link';
    } else {
        link.type = 'image';
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
    this.options = options || markedDefaults;
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

        tokens.footnotes = footnotes;
    }

    return tokens;
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

    if (
        type === 'horizontalRule' || type === 'code' || type === 'html'
        /* || type === 'space'*/
    ) {
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
        children = token.cells;
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

function marked(value, options) {
    if (options) {
        options = merge({}, markedDefaults, options);
    }

    var tokens = Lexer.lex(value, options);

    return Parser.parse(tokens, options);
}

/**
 * Expose
 */

marked.Parser = Parser;

marked.Lexer = Lexer;

module.exports = marked;
