'use strict';

/*
 * Cached method.
 */

var has = Object.prototype.hasOwnProperty;

/*
 * Map of overwrites for at-mentions.
 * GitHub does some fancy stuff with `@mention`, by linking
 * it to their blog-post introducing the feature.
 * To my knowledge, there are no other magical usernames.
 */

var OVERWRITES = {};

OVERWRITES.mentions = OVERWRITES.mention = 'blog/821';

/*
 * Username may only contain alphanumeric characters or
 * single hyphens, and cannot begin or end with a hyphen.
 *
 * `PERSON` is either a user or an organization, but also
 * matches a team:
 *
 *   https://github.com/blog/1121-introducing-team-mentions
 */

var NAME = '(?:[a-z0-9]{1,2}|[a-z0-9][a-z0-9-]{1,37}[a-z0-9])';
var PERSON = '(' + NAME + '(?:\\/' + NAME + ')?)';
var MENTION = new RegExp('^@' + PERSON + '\\b(?!-)', 'i');

/*
 * Expression that matches characters not used in the above
 * references.
 */

var NON_GITHUB = /^[\s\S]+?(?:[^/.@#_a-zA-Z0-9-](?=@)|(?=$))/;

/**
 * Render a mention.
 *
 * @param {Function} eat
 * @param {string} $0 - Whole content.
 * @param {Object} $1 - Username.
 * @return {Node}
 */
function mention(eat, $0, $1) {
    var now = eat.now();
    var href = 'https://github.com/';

    href += has.call(OVERWRITES, $1) ? OVERWRITES[$1] : $1;

    return eat($0)(this.renderLink(true, href, $0, null, now, eat));
}

mention.notInLink = true;

/**
 * Factory to parse plain-text, and look for github
 * entities.
 *
 * @param {Function} eat
 * @param {string} $0 - Content.
 * @return {Array.<Node>}
 */
function inlineText(eat, $0) {
    var self = this;
    var now = eat.now();

    return eat($0)(self.augmentGitHub($0, now));
}

/**
 * Attacher.
 *
 * @param {MDAST} mdast
 */
function attacher(mdast) {
    var proto = mdast.Parser.prototype;
    var scope = proto.inlineTokenizers;
    var current = scope.inlineText;

    /*
     * Add a tokenizer to the `Parser`.
     */

    proto.augmentGitHub = proto.tokenizeFactory('mentions');

    proto.mentionsMethods = ['mention'];

    proto.mentionsTokenizers = {
        'mention': mention
    };

    proto.expressions.gfm.mention = MENTION;

    /*
     * Overwrite `inlineText`.
     */

    proto.mentionsMethods.push('mentionsText');
    proto.mentionsTokenizers.mentionsText = current;
    proto.expressions.rules.mentionsText = NON_GITHUB;
    scope.inlineText = inlineText;
}

/*
 * Expose.
 */

module.exports = attacher;
