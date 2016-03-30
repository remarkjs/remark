/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @fileoverview Local remark configuration.
 */

module.exports = {
    'output': true,
    'plugins': {
        /* Custom natural-language validation. */
        'script/natural-language': null,
        'comment-config': null,
        'lint': {
            /* Ignore `final-definition` for `license` */
            'final-definition': false
        },
        'github': null,
        'usage': null,
        'toc': null,
        'license': null,
        'validate-links': null
    },
    'settings': {
        /* I personally like asterisks. */
        'bullet': '*'
    }
};
