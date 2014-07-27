'use strict';

/**
 * Block-Level Grammar
 */

/* istanbul ignore next: noop */
function noop() {}

var hasOwnProperty, noopExpression;

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

hasOwnProperty = Object.prototype.hasOwnProperty;

function merge(context) {
    var iterator = 0,
        length = arguments.length,
        target, key;

    while (++iterator < length) {
        target = arguments[iterator];

        for (key in target) {
            /* istanbul ignore else: hasownproperty */
            if (hasOwnProperty.call(target, key)) {
                context[key] = target[key];
            }
        }
    }

    return context;
}

/**
 * Helpers
 */

var block = {
    'newline' : /^\n+/,
    'code' : /^( {4}[^\n]+\n*)+/,
    'fences' : noopExpression,
    'hr' : /^( *[-*_]){3,} *(?:\n+|$)/,
    'heading' : /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
    'nptable' : noopExpression,
    'lheading' : /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
    'blockquote' : /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
    'list' :
        /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
    'html' : new RegExp(
            '^ *(?:comment *(?:\\n|\\s*$)|' +
            'closed *(?:\\n{2,}|\\s*$)|' +
            'closing *(?:\\n{2,}|\\s*$))'
        ),
    'def' :
        /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
    'table' : noopExpression,
    'paragraph' :
        /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
    'text' : /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')(/bull/g, block.bullet)();

block.list = replace(block.list)
    (/bull/g, block.bullet)
    ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
    ('def', '\\n+(?=' + block.def.source + ')')
    ();

block.blockquote = replace(block.blockquote)
    ('def', block.def)
    ();

block.tags = '(?!' +
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
    (/tag/g, block.tags)
    ();

block.paragraph = replace(block.paragraph)
    ('hr', block.hr)
    ('heading', block.heading)
    ('lheading', block.lheading)
    ('blockquote', block.blockquote)
    ('tag', '<' + block.tags)
    ('def', block.def)
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
    'nptable' :
        /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
    'table' : /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

var markedDefaults = {
    'gfm' : true,
    'tables' : true,
    'breaks' : false,
    'pedantic' : false,
    'smartLists' : false
};

/**
 * Block Lexer
 */

function Lexer(options) {
    this.tokens = [];
    this.tokens.links = {};
    this.options = options || markedDefaults;
    this.rules = block.normal;

    if (this.options.gfm) {
        if (this.options.tables) {
            this.rules = block.tables;
        } else {
            this.rules = block.gfm;
        }
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
    var next, loose, cap, bull, b, item, space, i, l;

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
        if (top && (cap = this.rules.nptable.exec(value))) {
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

        // lheading
        if (cap = this.rules.lheading.exec(value)) {
            value = value.substring(cap[0].length);
            this.tokens.push({
                'type' : 'heading',
                'depth' : cap[2] === '=' ? 1 : 2,
                'children' : cap[1]
            });
            continue;
        }

        // hr
        if (cap = this.rules.hr.exec(value)) {
            value = value.substring(cap[0].length);
            this.tokens.push({
                'type' : 'hr'
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
            bull = cap[2];

            this.tokens.push({
                'type' : 'list',
                'ordered' : bull.length > 1
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
                    item = !this.options.pedantic ?
                        item.replace(
                            new RegExp('^ {1,' + space + '}', 'gm'),
                            ''
                        ) :
                        item.replace(/^ {1,4}/gm, '');
                }

                // Determine whether the next list item belongs here.
                // Backpedal if it does not belong in this list.
                if (this.options.smartLists && i !== l - 1) {
                    b = block.bullet.exec(cap[i + 1])[0];
                    if (bull !== b && !(bull.length > 1 && b.length > 1)) {
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

        // def
        if ((!bq && top) && (cap = this.rules.def.exec(value))) {
            value = value.substring(cap[0].length);
            this.tokens.links[cap[1].toLowerCase()] = {
                'href' : cap[2],
                'title' : cap[3]
            };
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
    'autolink' : /^<([^ >]+(@|:\/)[^ >]+)>/,
    'url' : noopExpression,
    'tag' : /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
    'link' : /^!?\[(inside)\]\(href\)/,
    'reflink' : /^!?\[(inside)\]\s*\[([^\]]*)\]/,
    'nolink' : /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
    'strong' : /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
    'em' : /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
    'code' : /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
    'br' : /^ {2,}\n(?!\s*$)/,
    'del' : noopExpression,
    'text' : /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline.inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline.href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
    ('inside', inline.inside)('href', inline.href)();

inline.reflink = replace(inline.reflink)('inside', inline.inside)();

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
    'em' :
        /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
    'escape' : replace(inline.escape)('])', '~|])')(),
    'url' : /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
    'del' : /^~~(?=\S)([\s\S]*?\S)~~/,
    'text' : replace(inline.text)
        (']|', '~]|')
        ('|', '|https?://|')
        ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
    'br' : replace(inline.br)('{2,}', '*')(),
    'text' : replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
    this.options = options || markedDefaults;
    this.links = links;
    this.rules = inline.normal;

    if (!this.links) {
        throw new
            Error('Tokens array requires a `links` property.');
    }

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
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function (value, links, options) {
    var inline = new InlineLexer(links, options);
    return inline.output(value);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function (value) {
    var tokens = [],
        link, text, href, cap, prev;

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

        /* autolink */
        cap = this.rules.autolink.exec(value);

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

        // url (gfm)
        if (!this.inLink && (cap = this.rules.url.exec(value))) {
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

        // reflink, nolink
        if ((cap = this.rules.reflink.exec(value)) ||
            (cap = this.rules.nolink.exec(value))) {
            value = value.substring(cap[0].length);
            link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
            link = this.links[link.toLowerCase()];

            if (!link || !link.href) {
                tokens.push({
                    'type' : 'text',
                    'value' : cap[0].charAt(0)
                });

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

        // em
        if (cap = this.rules.em.exec(value)) {
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

        // br
        if (cap = this.rules.br.exec(value)) {
            value = value.substring(cap[0].length);

            tokens.push({
                'type' : 'br'
            });

            continue;
        }

        // del (gfm)
        if (cap = this.rules.del.exec(value)) {
            value = value.substring(cap[0].length);

            tokens.push({
                'type' : 'delete',
                'children' : this.output(cap[1])
            });

            continue;
        }

        // text
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

        if (value) {
            throw new
                Error('Infinite loop on byte: ' + value.charCodeAt(0));
        }
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
    var parser = new Parser(options);
    return parser.parse(value);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function (value) {
    this.inline = new InlineLexer(value.links, this.options);
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
 * Preview Next Token
 */

Parser.prototype.peek = function () {
    return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function () {
    var body = this.token.value;

    while (this.peek().type === 'text') {
        body += '\n' + this.next().children;
    }

    return this.inline.output(body);
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
        type === 'hr' || type === 'code' || type === 'html'
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

    if (type === 'text') {
        return this.parseText();
    }

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

marked.InlineLexer = InlineLexer;

module.exports = marked;
