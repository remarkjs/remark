/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @fileoverview Local remark configuration.
 */

module.exports = {
    'output': true,
    'plugins': {
        // 'comment-config': null,
        // 'github': null,
        // 'validate-links': null,
        'toc': {
            'maxDepth': 3,
            'tight': true
        },
        'lint': {
            /* `h6` for signatures. */
            'no-duplicate-headings': false,
            'heading-increment': false,

            /* Lists. */
            'list-item-spacing': false,
            'no-missing-blank-lines': false
        },
        "github": null,
        "comment-config": null,
        "validate-links": null
    },
    'settings': {
        /* I personally like asterisks. */
        'bullet': '*'
    }
};
