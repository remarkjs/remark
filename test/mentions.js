'use strict';

/* eslint-env node */

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

/**
 * Tokenize a mention.
 *
 * Username may only contain alphanumeric characters or
 * single hyphens, and cannot begin or end with a hyphen.
 *
 * This matches a user, an organization, or a team:
 *
 *   https://github.com/blog/1121-introducing-team-mentions
 *
 * @example
 *   tokenizeMention(eat, '@foo');
 *
 * @param {function(string)} eat
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `delete` node.
 */
function mention(eat, value, silent) {
    var index = 1;
    var length = value.length;
    var slash = -1;
    var character;
    var subvalue;
    var handle;
    var href;
    var now;

    if (value.charAt(0) !== '@' || value.charAt(1) === '-') {
        return;
    }

    while (index < length) {
        character = value.charAt(index);

        if (character === '/') {
            if (slash !== -1) {
                break
            }

            slash = index;

            if (
                value.charAt(index - 1) === '-' ||
                value.charAt(index + 1) === '-'
            ) {
                return;
            }
        } else if (!/[a-zA-Z0-9-]/.test(character)) {
            break;
        }

        index++;
    }

    if (value.charAt(index - 1) === '-') {
        return;
    }

    if (silent) {
        return;
    }

    now = eat.now();
    href = 'https://github.com/';
    handle = value.slice(1, index);
    subvalue = '@' + handle;

    href += has.call(OVERWRITES, handle) ? OVERWRITES[handle] : handle;

    return eat(subvalue)(
        this.renderLink(true, href, subvalue, null, now, eat)
    );
}

mention.notInLink = true;

/**
 * Attacher.
 *
 * @param {MDAST} mdast
 */
function attacher(mdast) {
    var proto = mdast.Parser.prototype;
    var methods = proto.inlineMethods;

    /*
     * Add `@` as a special inline character.
     */

    mdast.data.inlineTextStop.gfm.push('@');

    /*
     * Add a tokenizer to the `Parser`.
     */

    proto.inlineTokenizers.mention = mention;
    methods.splice(methods.indexOf('inlineText'), 0, 'mention');
}

/*
 * Expose.
 */

module.exports = attacher;
