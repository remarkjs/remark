'use strict';

/*
 * Dependencies.
 */

var fs = require('fs');

/*
 * Methods.
 */

var write = fs.writeFileSync;

/*
 * Expressions.
 */

var EXPRESSION = /(^|[^\[])\^/g;

/**
 * Clean an expression.
 *
 * @param {RegExp|string} expression
 * @return {string}
 */
function cleanExpression(expression) {
    return (expression.source || expression).replace(EXPRESSION, '$1');
}

/*
 * Exports.
 */

var expressions = {};

/*
 * Block rules;
 */

var rules = {};

expressions.rules = rules;

/*
 * Block helpers.
 */

rules.newline = /^\n+/;

rules.bullet = /(?:[*+-]|\d+\.)/;

rules.code = /^((?: {4}|\t)[^\n]+\n*)+/;

rules.horizontalRule = /^[ \t]*([-*_])( *\1){2,} *(?=\n|$)/;

rules.heading = /^[ \t]*((#{1,6})[ \t]+)([^\n]+?) *#* *(?=\n|$)/;

rules.lineHeading = /^([^\n]+)\n *(=|-){2,} *(?=\n|$)/;

rules.linkDefinition =
    /^[ \t]*\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?=\n|$)/;

rules.blockText = /^[^\n]+/;

rules.item = new RegExp(
    '^([ \\t]*)(' +
        cleanExpression(rules.bullet) +
    ')[ \\t][^\\n]*(?:\\n(?!\\1' +
        cleanExpression(rules.bullet) +
    '[ \\t])[^\\n]*)*',
'gm');

rules.list = new RegExp(
    '^' +
    '([ \\t]*)' +
    '(' + cleanExpression(rules.bullet) + ')' +
    '(' +
        '(?:[ \\t][\\s\\S]+?)' +
        '(?:' +

            /*
             * Modified Horizontal rule:
             */

            '\\n+(?=\\1?(?:[-*_][ \\t]*){3,}(?=\\n|$))' +
            '|' +

            /*
             * Modified Link Definition:
             */

            '\\n+(?=' + cleanExpression(rules.linkDefinition) + ')' +
            '|' +

            '\\n{2,}(?![ \\t])(?!\\1' +
                cleanExpression(rules.bullet) +
            '[ \\t])' +
            '|' +

            '\\s*$' +
        ')' +
    ')'
);

rules.blockquote = new RegExp(
    '^([ \\t]*>[^\\n]+(\\n(?!' +

    cleanExpression(rules.linkDefinition) +

    ')[^\\n]+)*)+'
);

var inlineTags;

inlineTags = (
    '(?!' +
        '(?:' +
            'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|' +
            'var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|' +
            'span|br|wbr|ins|del|img' +
        ')\\b' +
    ')' +
    '\\w+(?!:' +
        '\\/|[^\\w\\s@]*@' +
    ')\\b'
);

rules.html = new RegExp(
    '^[ \\t]*(?:' +

        /*
         * HTML comment.
         */

        cleanExpression('<!--[\\s\\S]*?-->') +
        '[ \\t]*(?:\\n|\\s*$)|' +

        /*
         * Closed tag.
         */

        cleanExpression('<(' + inlineTags + ')[\\s\\S]+?<\\/\\1>') +
        '[ \\t]*(?:\\n{2,}|\\s*$)|' +

        /*
         * Closing tag.
         */

        cleanExpression(
            '<' + inlineTags + '(?:"[^"]*"|\'[^\']*\'|[^\'">])*?>'
        ) +
        '[ \\t]*' +
        '(?:\\n{2,}|\\s*$)' +
    ')'
);

rules.paragraph = new RegExp(
    '^(?:(?:' +
        '[^\\n]+\\n?' +
        '(?!' +
            cleanExpression(rules.horizontalRule) +
            '|' +
            cleanExpression(rules.heading) +
            '|' +
            cleanExpression(rules.lineHeading) +
            '|' +
            cleanExpression(rules.blockquote) +
            '|' +
            cleanExpression('<' + inlineTags) +
            '|' +
            cleanExpression(rules.linkDefinition) +
        ')' +
    ')+)'
);

/*
 * GFM + Tables Block Grammar
 */

var tables = {};

expressions.tables = tables;

tables.table =
    /^( *\|(.+))\n( *\|( *[-:]+[-| :]*)\n)((?: *\|.*(?:\n|$))*)/;

tables.looseTable =
    /^( *(\S.*\|.*))\n( *([-:]+ *\|[-| :]*)\n)((?:.*\|.*(?:\n|$))*)/;

/*
 * GFM Block Grammar.
 */

var gfm = {};

expressions.gfm = gfm;

gfm.fences =
    /^[ \t]*(`{3,}|~{3,})[ \t]*(\S+)?[ \t]*\n([\s\S]*?)\s*\1[ \t]*(?=\n|$)/;

gfm.paragraph = new RegExp(
    rules.paragraph.source.replace('(?=\\n|$)|', '(?=\\n|$)|' +
        cleanExpression(gfm.fences).replace(/\\1/g, '\\3') +
        '|' +
        cleanExpression(rules.list).replace(/\\1/g, '\\6') +
        '|'
    )
);

/*
 * Footnote block grammar
 */

var footnotes = {};

expressions.footnotes = footnotes;

footnotes.footnoteDefinition =
    /^( *\[\^([^\]]+)\]: *)([^\n]+(\n+ +[^\n]+)*)/;

/*
 * YAML front matter.
 */

var yaml = {};

expressions.yaml = yaml;

yaml.yamlFrontMatter = /^-{3}\n([\s\S]+?\n)?-{3}/;

/*
 * Inline-Level Grammar.
 */

rules.escape = /^\\([\\`*{}\[\]()#+\-.!_>])/;

rules.autoLink = /^<([^ >]+(@|:\/)[^ >]+)>/;

rules.tag = /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/;

rules.invalidLink = /^(!?\[)((?:\[[^\]]*\]|[^\[\]])*)\]/;

rules.strong = /^(_)_([\s\S]+?)__(?!_)|^(\*)\*([\s\S]+?)\*\*(?!\*)/;

rules.emphasis =
    /^\b(_)((?:__|[\s\S])+?)_\b|^(\*)((?:\*\*|[\s\S])+?)\*(?!\*)/;

rules.inlineCode = /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/;

rules.break = /^ {2,}\n(?!\s*$)/;

rules.text = /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/;

rules.inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;

rules.href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

rules.link = new RegExp(
    '^(!?\\[)(' +
        cleanExpression(rules.inside) +
    ')\\]\\(' +
        cleanExpression(rules.href) +
    '\\)'
);

rules.referenceLink = new RegExp(
    '^(!?\\[)(' +
        cleanExpression(rules.inside) +
    ')\\]\\s*\\[([^\\]]*)\\]'
);

/*
 * GFM inline Grammar.
 */

gfm.escape = new RegExp(
    rules.escape.source.replace('])', '~|])')
);

gfm.url = /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/;

gfm.deletion = /^~~(?=\S)([\s\S]*?\S)~~/;

gfm.text = new RegExp(
    rules.text.source.replace(']|', '~]|').replace('|', '|https?:\\/\\/|')
);

/*
 * Pedantic Inline Grammar.
 */

var pedantic = {};

expressions.pedantic = pedantic;

pedantic.strong =
    /^(_)_(?=\S)([\s\S]*?\S)__(?!_)|^(\*)\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/;

pedantic.emphasis =
    /^(_)(?=\S)([\s\S]*?\S)_(?!_)|^(\*)(?=\S)([\s\S]*?\S)\*(?!\*)/;

/*
 * CommonMark and CommonMark + GFM.
 */

var commonmark = {};
var commonmarkGFM = {};

/**
 * Replace zero or more spaces or tabs with
 * between 0 and 3 spaces.
 *
 * @param {RegExp} expression
 * @return {RegExp}
 */
function commonmarkIndentation(expression) {
    return new RegExp(expression.source.replace(/\[ \\t\]\*/g, function () {
        return '\\ {0,3}';
    }));
}

commonmark.paragraph = commonmarkIndentation(rules.paragraph);
commonmarkGFM.paragraph = commonmarkIndentation(gfm.paragraph);

expressions.commonmark = commonmark;
expressions.commonmarkGFM = commonmarkGFM;

/*
 * GFM + Line Breaks Inline Grammar
 */

var breaks = {};
var breaksGFM = {};

expressions.breaks = breaks;
expressions.breaksGFM = breaksGFM;

breaks.break = new RegExp(rules.break.source.replace('{2,}', '*'));
breaks.text = new RegExp(rules.text.source.replace('{2,}', '*'));

breaksGFM.text = new RegExp(
    gfm.text.source.replace('{2,}', '*')
);

/*
 * Write.
 */

var content;

content = '/* This file is generated by `script/build-expressions.js` */\n' +
    'module.exports={\n' +
    Object.keys(expressions).map(function (key) {
        var map = expressions[key];
        return '  "' + key + '": {\n' + Object.keys(map).map(function (name) {
            return '    "' + name + '":' + map[name].toString();
        }).join(',\n') + '\n  }';
    }).join(',\n') +
    '\n};\n';

write('lib/expressions.js', content);
