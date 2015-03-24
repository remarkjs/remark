'use strict';

var NAME = '(?:[a-z0-9]-[a-z0-9]|[a-z0-9]){1,39}';
var PERSON = '(' + NAME + ')';

var EXPRESSION_MENTION = new RegExp('^@' + PERSON, 'i');

/**
 * Plugin.
 */
function plugin() {}

/**
 * Tokenize a mention
 *
 * @param {Function} eat
 * @param {string} $0 - Whole mention.
 * @param {string} $1 - Name.
 */
function mention(eat, $0, $1) {
    var now = eat.now();
    var href;

    if ($1 === 'mention') {
        href = 'https://github.com/blog/821';
    } else {
        href = 'https://github.com/' + $1;
    }

    eat($0)(this.renderLink(true, href, $0, null, now));
}

mention.notInLink = true;

/**
 * Attach expressions to mdast.
 *
 * @param {MDAST} mdast
 * @return {Function}
 */
function attach(mdast) {
    var parserProto = mdast.Parser.prototype;
    var expressions = parserProto.expressions;

    ['rules', 'gfm', 'breaks', 'breaksGFM'].forEach(function (key) {
        expressions[key].inlineText = new RegExp(
            expressions[key].inlineText.source.replace(
                '(?=', '(?:\\s(?=@)|(?='
            ) + ')'
        );
    });

    parserProto.inlineTokenizers.mention = mention;
    parserProto.expressions.rules.mention = EXPRESSION_MENTION;
    parserProto.inlineMethods.unshift('mention');

    return plugin;
}

/*
 * Expose `attach`.
 */

module.exports = attach;
