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

/**
 * Create something that matches until `end` is found,
 * which does allow an escaped `end`, but not `end` itself.
 *
 * @param {string} end
 * @return {string}
 */
function groupContent(end, negate) {
    return '(?:' +

        /*
         * Match an escape.
         */

        '\\\\[\\s\\S]' +

        '|' +

        /*
         * Match anything other than `end`.
         */

        '[^' + (negate || end) + ']' +
    ')*';
}

/**
 * Create a group: something that matches from `start`
 * until end, which does allow an escaped `end`, but
 * not `end` itself.
 *
 * @param {string} start
 * @param {string?} end - Defaults to end.
 * @return {string}
 */
function group(start, end, negate) {
    return start + '(' + groupContent(end || start, negate) + '?)' + (end || start);
}

/*
 * Exports.
 */

var expressions = {};
var rules = {};
var gfm = {};
var footnotes = {};
var yaml = {};
var pedantic = {};
var commonmark = {};
var commonmarkGFM = {};
var breaks = {};
var breaksGFM = {};

expressions.rules = rules;
expressions.gfm = gfm;
expressions.footnotes = footnotes;
expressions.yaml = yaml;
expressions.pedantic = pedantic;
expressions.commonmark = commonmark;
expressions.commonmarkGFM = commonmarkGFM;
expressions.breaks = breaks;
expressions.breaksGFM = breaksGFM;

/*
 * HTML Block elements.
 */

var HTML_BLOCK_ELEMENTS = '(?:' + [
    'article',
    'header',
    'aside',
    'hgroup',
    'blockquote',
    'hr',
    'iframe',
    'body',
    'li',
    'map',
    'button',
    'object',
    'canvas',
    'ol',
    'caption',
    'output',
    'col',
    'p',
    'colgroup',
    'pre',
    'dd',
    'progress',
    'div',
    'section',
    'dl',
    'table',
    'td',
    'dt',
    'tbody',
    'embed',
    'textarea',
    'fieldset',
    'tfoot',
    'figcaption',
    'th',
    'figure',
    'thead',
    'footer',
    'tr',
    'form',
    'ul',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'video',
    'script',
    'style'
].join('|') + ')';

/*
 * Block helpers.
 */

rules.newline = /^\n([ \t]*\n)*/;

rules.code = /^((?: {4}|\t)[^\n]*\n?([ \t]*\n)*)+/;

rules.horizontalRule = /^[ \t]*([-*_])( *\1){2,} *(?=\n|$)/;

pedantic.heading =
    /^([ \t]*)(#{1,6})([ \t]*)([^\n]*?)[ \t]*#*[ \t]*(?=\n|$)/;

rules.heading =
    /^([ \t]*)(#{1,6})(?:([ \t]+)([^\n]+?))??(?:[ \t]+#+)?[ \t]*(?=\n|$)/;

rules.lineHeading =
    /^(\ {0,3})([^\n]+?)[ \t]*\n\ {0,3}(=|-){1,}[ \t]*(?=\n|$)/;

rules.definition =
    /^[ \t]*\[((?:[^\\](?:\\|\\(?:\\{2})+)\]|[^\]])+)\]:[ \t\n]*(<[^>\[\]]+>|[^\s\[\]]+)(?:[ \t\n]+['"(]((?:[^\n]|\n(?!\n))*?)['")])?[ \t]*(?=\n|$)/;

rules.bullet = /(?:[*+-]|\d+\.)/;

rules.indent = new RegExp(
    '^([ \\t]*)(' + cleanExpression(rules.bullet) + ')( {1,4}(?! )| |\\t)'
);

rules.item = new RegExp(
    cleanExpression(rules.indent) +
    '[^\\n]*(?:\\n(?!\\1' +
        cleanExpression(rules.bullet) +
    '[ \\t])[^\\n]*)*',
'gm');

rules.list = new RegExp(
    '^' +
    '([ \\t]*)' +
    '(' + cleanExpression(rules.bullet) + ')' +
    '[ \\t][\\s\\S]+?' +
    '(?:' +

        /*
         * Modified Horizontal rule:
         */

        '(?=\\n+\\1?(?:[-*_][ \\t]*){3,}(?:\\n|$))' +
        '|' +

        /*
         * Modified Link Definition:
         */

        '(?=\\n+' + cleanExpression(rules.definition) + ')' +
        '|' +

        '\\n{2,}(?![ \\t])(?!\\1' +
            cleanExpression(rules.bullet) +
        '[ \\t])' +
        '|' +

        '$' +
    ')'
);

function replaceBullet(expression) {
    return expression.source.replace(/\\d\+\\\./g, '\\d+[\\.\\)]');
}

commonmark.list = new RegExp(replaceBullet(rules.list));
commonmark.item = new RegExp(replaceBullet(rules.item), 'gm');
commonmark.bullet = new RegExp(replaceBullet(rules.bullet));
commonmark.indent = new RegExp(replaceBullet(rules.indent));

rules.blockquote = new RegExp(
    '^(?=[ \\t]*>)(?:' +
        '(?:' +
            '(?:' +
                '[ \\t]*>[^\\n]*\\n' +
            ')*' +
            '(?:' +
                '[ \\t]*>[^\\n]+(?=\\n|$)' +
            ')' +
            '|' +
            '(?!' +
                '[ \\t]*>' +
            ')' +
            '(?!' +
                cleanExpression(rules.definition) +
            ')' +
            '[^\\n]+' +
        ')' +
        '(?:\\n|$)' +
    ')*' +
    '(?:' +
        '[ \\t]*>[ \\t]*' +
        '(?:' +
            '\\n[ \\t]*>[ \\t]*' +
        ')*' +
    ')?'
);

var inlineTags = '(?!' +
        '(?:' +
            'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|' +
            'var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|' +
            'span|br|wbr|ins|del|img' +
        ')\\b' +
    ')' +
    '(?!mailto:)' +
    '\\w+(?!' +
        ':\\/|[^\\w\\s@]*@' +
    ')\\b';

var tagName = '(?:[a-zA-Z][a-zA-Z0-9]*)';
var attributeName = '(?:[a-zA-Z_:][a-zA-Z0-9_.:-]*)';
var whitespace = '(?:\\s+)';
var unquotedAttribute = '[^"\'=<>`]+';
var singleQuotedAttribute = '\'[^\']*\'';
var doubleQuotedAttribute = '"[^"]*"';
var attributeValue = '(?:' + unquotedAttribute + '|' + singleQuotedAttribute + '|' + doubleQuotedAttribute + ')';
var attributeValueSpec = '(?:' + whitespace + '?' + '=' + whitespace + '?' + attributeValue + ')';
var attribute = '(?:' + whitespace + attributeName + attributeValueSpec + '?)';
var openTag = '(?:<' + tagName + attribute + '*' + whitespace + '?/?>)';
var closingTag = '(?:</' + tagName + whitespace + '?>)';
var openBlockTag = '(?:<' + HTML_BLOCK_ELEMENTS + attribute + '*' + whitespace + '?/?>?)';
var closingBlockTag = '(?:</' + HTML_BLOCK_ELEMENTS + whitespace + '?>)';
var htmlComment = '<!--[\\s\\S]*?-->';
var commonmarkComment = '(?:<!--(?!-?>)(?:[^-]|-(?!-))*-->)';
var processingInstruction = '(?:<\\?(?:[^\\?]|\\?(?!>))+\\?>)';
var declaration = '(?:<![a-zA-Z]+\\s+[\\s\\S]+?>)';
var cdata = '(?:<!\\[CDATA\\[[\\s\\S]+?\\]\\]>)';
var htmlBlockTag = '(?:' + openBlockTag + '|' + closingBlockTag + ')';

var inlineTag = '^(?:' +
    openTag + '|' +
    closingTag + '|' +
    htmlComment + '|' +
    processingInstruction + '|' +
    declaration + '|' +
    cdata +
')';

var commonmarkInlineTag = '^(?:' +
    openTag + '|' +
    closingTag + '|' +
    commonmarkComment + '|' +
    processingInstruction + '|' +
    declaration + '|' +
    cdata +
')';

var html = new RegExp('^(?:' +
    '[ \\t]*' +
    '(?:' +
        htmlBlockTag + '|' +
        htmlComment + '|' +
        processingInstruction + '|' +
        declaration + '|' +
        cdata +
    ')' +
    '[\\s\\S]*?' +
    '[ \\t]*?' +
    '(?:\\n{2,}|\\s*$)' +
')', 'i');

var commonmarkHTML = new RegExp('^(?:' +
    '[ \\t]*' +
    '(?:' +
        htmlBlockTag + '|' +
        commonmarkComment + '|' +
        processingInstruction + '|' +
        declaration + '|' +
        cdata +
    ')' +
    '[\\s\\S]*?' +
    '[ \\t]*?' +
    '(?:\\n{2,}|\\s*$)' +
')', 'i');

rules.html = html;
commonmark.html = commonmarkHTML;

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
            cleanExpression(rules.definition) +
            '|' +
            cleanExpression(rules.blockquote) +
            '|' +
            cleanExpression('<' + inlineTags) +
        ')' +
    ')+)'
);

/*
 * GFM Block Grammar.
 */

gfm.fences =
    /^( *)(([`~])\3{2,})[ \t]*([^\n`~]+)?[ \t]*(?:\n([\s\S]*?))??(?:\n\ {0,3}\2\3*[ \t]*(?=\n|$)|$)/;

gfm.paragraph = new RegExp(
    rules.paragraph.source.replace('(?=\\n|$)|', '(?=\\n|$)|' +
        cleanExpression(gfm.fences).replace(/\\2/g, '\\4').replace(/\\3/g, '\\5') +
        '|' +
        cleanExpression(rules.list).replace(/\\1/g, '\\8') +
        '|'
    )
);

gfm.table =
    /^( *\|(.+))\n( *\|( *[-:]+[-| :]*)\n)((?: *\|.*(?:\n|$))*)/;

gfm.looseTable =
    /^( *(\S.*\|.*))\n( *([-:]+ *\|[-| :]*)\n)((?:.*\|.*(?:\n|$))*)/;

/*
 * Footnote block grammar
 */

footnotes.footnoteDefinition =
    /^( *\[\^([^\]]+)\]: *)([^\n]+(\n+ +[^\n]+)*)/;

/*
 * YAML front matter.
 */

yaml.yamlFrontMatter = /^-{3}\n([\s\S]+?\n)?-{3}/;

/*
 * Inline-Level Grammar.
 */

rules.escape = /^\\([\\`*{}\[\]()#+\-.!_>])/;

rules.autoLink = /^<([^ >]+(@|:\/)[^ >]+)>/;

rules.tag = new RegExp(inlineTag);
commonmark.tag = new RegExp(commonmarkInlineTag);

rules.strong = /^(_)_((?:\\[\s\S]|[^\\])+?)__(?!_)|^(\*)\*((?:\\[\s\S]|[^\\])+?)\*\*(?!\*)/;

rules.emphasis =
    /^\b(_)((?:__|\\[\s\S]|[^\\])+?)_\b|^(\*)((?:\*\*|\\[\s\S]|[^\\])+?)\*(?!\*)/;

rules.inlineCode = /^(`+)((?!`)[\s\S]*?(?:`\s+|[^`]))?(\1)(?!`)/;

rules.break = /^ {2,}\n(?!\s*$)/;

rules.inlineText = /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/;

/*
 * Supports up to three nested, matching square braces.
 */

var commonmarkInside =
    '(?:' +
        '(?:' +
            '\\[(?:' +
                '\\[(?:' +
                    '\\\\[\\s\\S]' +
                    '|' +
                    '[^\\[\\]]' +
                ')*?\\]' +
                '|' +
                '\\\\[\\s\\S]' +
                '|' +
                '[^\\[\\]]' +
            ')*?\\]' +
        ')' +
        '|' +
        '\\\\[\\s\\S]' +
        '|' +
        '[^\\[\\]]' +
    ')*?';


var inside =
    '(?:' +
        '\\[[^\\]]*\\]' +
        '|' +
        '[^\\[\\]]' +
        '|' +
        '\\]' +
        '(?=' +
            '[^\\[]*\\]' +
        ')' +
    ')*';

var commonmarkTitle =
    '(?:\\s+(?:' +
        group('\\\'') + '|' +
        group('"') + '|' +
        group('\\(', '\\)') +
    '))?';

var title = '(?:' +
        '\\s+[\'"]' +
        '(' +
            '[\\s\\S]*?' +
        ')' +
        '[\'"]' +
    ')?';

/*
 * Supports up to one nested, matching pair of parens.
 */

var commonmarkHREF =
    '(?:' +
        '(?!<)(' +
            '(?:' +
                '\\(' + groupContent('\\)', '\\(\\)\\s') + '?\\)' +
                '|' +
                '\\\\[\\s\\S]' +
                '|' +
                '[^\\(\\)\\s]' +
            ')*?' +
        ')' +
        '|' +
        '<(' +
            '[^\\n]*?' +
        ')>' +
    ')';

var href = '(?:' +
        '(?!<)' +
        '(' +
            '(?:' +
                '\\(' +
                '(?:' +
                    '\\\\[\\s\\S]' +
                    '|' +
                    '[^\\)]' +
                ')*?\\)' +
                '|' +
                '\\\\[\\s\\S]' +
                '|' +
                '[\\s\\S]' +
            ')*?' +
        ')' +
        '|' +
        '<(' +
            '[\\s\\S]*?' +
        ')>' +
    ')';

commonmark.link = new RegExp(
    '^(' +
        '!?\\[' +
    ')' +
    '(' +
        commonmarkInside +
    ')' +
    '\\]\\(\\s*' +
    commonmarkHREF +
    commonmarkTitle +
    '\\s*\\)'
);

rules.link = new RegExp(
    '^(' +
        '!?\\[' +
    ')' +
    '(' +
        inside +
    ')' +
    '\\]\\(\\s*' +
    href +
    title +
    '\\s*\\)'
);

rules.shortcutReference = new RegExp(
    '^(' +
        '!?\\[' +
    ')' +
    '(' +
        '(?:' +
            '\\\\[\\s\\S]' +
            '|' +
            '[^\\[\\]]' +
        ')+?' +
    ')' +
    '\\]'
);

rules.reference = new RegExp(
    '^(' +
        '!?\\[' +
    ')' +
    '(' +
        inside +
    ')' +
    '\\]' +
    '\\s*\\[' +
    '(' +
        groupContent('\\]', '\\[\\]') +
    ')' +
    '\\]'
);

commonmark.reference = new RegExp(
    '^(' +
        '!?\\[' +
    ')' +
    '(' +
        commonmarkInside +
    ')' +
    '\\]' +
    '\\s*\\[' +
    '(' +
        groupContent('\\]', '\\[\\]') +
    ')' +
    '\\]'
);

/*
 * GFM inline Grammar.
 */

gfm.escape = new RegExp(rules.escape.source.replace('])', '~|])'));

gfm.url = /^https?:\/\/[^\s<]+[^<.,:;"')\]\s]/;

gfm.deletion = /^~~(?=\S)([\s\S]*?\S)~~/;

gfm.inlineText = new RegExp(
    rules.inlineText.source.replace(']|', '~]|https?:\\/\\/|')
);

/*
 * Pedantic Inline Grammar.
 */

pedantic.strong =
    /^(_)_(?=\S)([\s\S]*?\S)__(?!_)|^(\*)\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/;

pedantic.emphasis =
    /^(_)(?=\S)([\s\S]*?\S)_(?!_)|^(\*)(?=\S)([\s\S]*?\S)\*(?!\*)/;

/*
 * CommonMark and CommonMark + GFM.
 */

/**
 * @param {RegExp} expression
 * @return {RegExp}
 */
function commonmarkParagraph(expression) {
    return new RegExp(expression.source
        .replace(cleanExpression(rules.lineHeading) + '|', '')
        .replace(cleanExpression(rules.definition) + '|', '')
        .replace(/\[ \\t\]\*/g, function () {
            return '\\ {0,3}';
        })
    );
}

commonmark.paragraph = commonmarkParagraph(rules.paragraph);
commonmarkGFM.paragraph = commonmarkParagraph(gfm.paragraph);

commonmark.blockquote = new RegExp(
    rules.blockquote.source.replace(')(?!', ')(?!' +
        cleanExpression(rules.horizontalRule) + '|' +
        cleanExpression(rules.list).replace(/\\1/g, '\\3') + '|' +
        cleanExpression(gfm.fences)
            .replace(/\\2/g, '\\9')
            .replace(/\\3/g, '\\10') + '|' +
        cleanExpression(rules.code) + '|'
    )
);

/*
 * The commonmark also matches all GFM escapes,
 * so we do not need to overwrite it.
 */

commonmark.escape = new RegExp(
    rules.escape.source
        .replace('])', '"$%&\',/:;<=?@^~|])')
        .replace('([', '(\\n|[')
);


/*
 * GFM + Line Breaks Inline Grammar
 */

breaks.break = new RegExp(rules.break.source.replace('{2,}', '*'));
breaks.inlineText = new RegExp(rules.inlineText.source.replace('{2,}', '*'));

breaksGFM.inlineText = new RegExp(
    gfm.inlineText.source.replace('{2,}', '*')
);

/*
 * Write.
 */

var content;

content = '/* This file is generated by `script/build-expressions.js` */\n' +
    'module.exports = {\n' +
    Object.keys(expressions).map(function (key) {
        var map = expressions[key];
        var result;

        result = '  \'' + key + '\': {\n';

        result += Object.keys(map).map(function (name) {
            return '    \'' + name + '\': ' + map[name].toString();
        }).join(',\n');

        return result + '\n  }';
    }).join(',\n') +
    '\n};\n';

write('lib/expressions.js', content);
