/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module Stringify
 * @fileoverview Compile a an abstract syntax tree into
 *   a markdown document.
 */

'use strict';

/*
 * Dependencies.
 */

var table = require('markdown-table');
var repeat = require('repeat-string');
var utilities = require('./utilities.js');
var defaultOptions = require('./defaults.js').stringify;

/*
 * Methods.
 */

var clone = utilities.clone;
var raise = utilities.raise;
var validate = utilities.validate;
var count = utilities.countCharacter;
var objectCreate = utilities.create;

/*
 * Constants.
 */

var HALF = 2;
var INDENT = 4;
var MINIMUM_CODE_FENCE_LENGTH = 3;
var YAML_FENCE_LENGTH = 3;
var MINIMUM_RULE_LENGTH = 3;
var MAILTO = 'mailto:';

/*
 * Expressions.
 */

var EXPRESSIONS_WHITE_SPACE = /\s/;

/*
 * Characters.
 */

var ANGLE_BRACKET_CLOSE = '>';
var ANGLE_BRACKET_OPEN = '<';
var ASTERISK = '*';
var CARET = '^';
var COLON = ':';
var DASH = '-';
var DOT = '.';
var EMPTY = '';
var EQUALS = '=';
var EXCLAMATION_MARK = '!';
var HASH = '#';
var LINE = '\n';
var PARENTHESIS_OPEN = '(';
var PARENTHESIS_CLOSE = ')';
var PIPE = '|';
var PLUS = '+';
var QUOTE_DOUBLE = '"';
var QUOTE_SINGLE = '\'';
var SPACE = ' ';
var SQUARE_BRACKET_OPEN = '[';
var SQUARE_BRACKET_CLOSE = ']';
var TICK = '`';
var TILDE = '~';
var UNDERSCORE = '_';

/*
 * Character combinations.
 */

var BREAK = LINE + LINE;
var GAP = BREAK + LINE;
var DOUBLE_TILDE = TILDE + TILDE;

/*
 * Allowed list-bullet characters.
 */

var LIST_BULLETS = objectCreate();

LIST_BULLETS[ASTERISK] = true;
LIST_BULLETS[DASH] = true;
LIST_BULLETS[PLUS] = true;

/*
 * Allowed horizontal-rule bullet characters.
 */

var HORIZONTAL_RULE_BULLETS = objectCreate();

HORIZONTAL_RULE_BULLETS[ASTERISK] = true;
HORIZONTAL_RULE_BULLETS[DASH] = true;
HORIZONTAL_RULE_BULLETS[UNDERSCORE] = true;

/*
 * Allowed emphasis characters.
 */

var EMPHASIS_MARKERS = objectCreate();

EMPHASIS_MARKERS[UNDERSCORE] = true;
EMPHASIS_MARKERS[ASTERISK] = true;

/*
 * Allowed fence markers.
 */

var FENCE_MARKERS = objectCreate();

FENCE_MARKERS[TICK] = true;
FENCE_MARKERS[TILDE] = true;

/*
 * Which method to use based on `list.ordered`.
 */

var ORDERED_MAP = objectCreate();

ORDERED_MAP.true = 'visitOrderedItems';
ORDERED_MAP.false = 'visitUnorderedItems';

/*
 * Which checkbox to use.
 */

var CHECKBOX_MAP = objectCreate();

CHECKBOX_MAP.null = '';
CHECKBOX_MAP.undefined = '';
CHECKBOX_MAP.true = SQUARE_BRACKET_OPEN + 'x' + SQUARE_BRACKET_CLOSE + SPACE;
CHECKBOX_MAP.false = SQUARE_BRACKET_OPEN + SPACE + SQUARE_BRACKET_CLOSE +
    SPACE;

/**
 * Checks if `url` needs to be enclosed by angle brackets.
 *
 * @example
 *   encloseURI('foo bar') // '<foo bar>'
 *   encloseURI('foo(bar(baz)') // '<foo(bar(baz)>'
 *   encloseURI('') // '<>'
 *   encloseURI('example.com') // 'example.com'
 *   encloseURI('example.com', true) // '<example.com>'
 *
 * @param {string} uri
 * @param {boolean?} [always] - Force enclosing.
 * @return {boolean} - Properly enclosed `uri`.
 */
function encloseURI(uri, always) {
    if (
        always ||
        !uri.length ||
        EXPRESSIONS_WHITE_SPACE.test(uri) ||
        count(uri, PARENTHESIS_OPEN) !== count(uri, PARENTHESIS_CLOSE)
    ) {
        return ANGLE_BRACKET_OPEN + uri + ANGLE_BRACKET_CLOSE;
    }

    return uri;
}

/**
 * There is currently no way to support nested delimiters
 * across Markdown.pl, CommonMark, and GitHub (RedCarpet).
 * The following supports Markdown.pl, and GitHub.
 * CommonMark is not supported when mixing double- and
 * single quotes inside a title.
 *
 * @see https://github.com/vmg/redcarpet/issues/473
 * @see https://github.com/jgm/CommonMark/issues/308
 *
 * @example
 *   encloseTitle('foo') // '"foo"'
 *   encloseTitle('foo \'bar\' baz') // '"foo \'bar\' baz"'
 *   encloseTitle('foo "bar" baz') // '\'foo "bar" baz\''
 *   encloseTitle('foo "bar" \'baz\'') // '"foo "bar" \'baz\'"'
 *
 * @param {string} title - Content.
 * @return {string} - Properly enclosed title.
 */
function encloseTitle(title) {
    var delimiter = QUOTE_DOUBLE;

    if (title.indexOf(delimiter) !== -1) {
        delimiter = QUOTE_SINGLE;
    }

    return delimiter + title + delimiter;
}

/**
 * Get the count of the longest repeating streak
 * of `character` in `value`.
 *
 * @example
 *   getLongestRepetition('` foo `` bar `', '`') // 2
 *
 * @param {string} value - Content.
 * @param {string} character - Single character to look
 *   for.
 * @return {number} - Number of characters at the place
 *   where `character` occurs in its longest streak in
 *   `value`.
 */
function getLongestRepetition(value, character) {
    var highestCount = 0;
    var index = -1;
    var length = value.length;
    var currentCount = 0;
    var currentCharacter;

    while (++index < length) {
        currentCharacter = value.charAt(index);

        if (currentCharacter === character) {
            currentCount++;

            if (currentCount > highestCount) {
                highestCount = currentCount;
            }
        } else {
            currentCount = 0;
        }
    }

    return highestCount;
}

/**
 * Pad `value` with `level * INDENT` spaces.  Respects
 * lines.
 *
 * @example
 *   pad('foo', 1) // '    foo'
 *
 * @param {string} value - Content.
 * @param {number} level - Indentation level.
 * @return {string} - Padded `value`.
 */
function pad(value, level) {
    var index;
    var padding;

    value = value.split(LINE);

    index = value.length;
    padding = repeat(SPACE, level * INDENT);

    while (index--) {
        if (value[index].length !== 0) {
            value[index] = padding + value[index];
        }
    }

    return value.join(LINE);
}

/**
 * Construct a new compiler.
 *
 * @example
 *   var compiler = new Compiler(new File('> foo.'));
 *
 * @constructor
 * @class {Compiler}
 * @param {File} file - Virtual file.
 * @param {Object?} [options] - Passed to
 *   `Compiler#setOptions()`.
 */
function Compiler(file, options) {
    var self = this;

    self.file = file;

    self.options = clone(self.options);

    self.setOptions(options);
}

/*
 * Cache prototype.
 */

var compilerPrototype = Compiler.prototype;

/*
 * Expose defaults.
 */

compilerPrototype.options = defaultOptions;

/*
 * Map of applicable enum's.
 */

var maps = {
    'bullet': LIST_BULLETS,
    'rule': HORIZONTAL_RULE_BULLETS,
    'emphasis': EMPHASIS_MARKERS,
    'strong': EMPHASIS_MARKERS,
    'fence': FENCE_MARKERS
};

/**
 * Set options.  Does not overwrite previously set
 * options.
 *
 * @example
 *   var compiler = new Compiler();
 *   compiler.setOptions({bullet: '*'});
 *
 * @this {Compiler}
 * @throws {Error} - When an option is invalid.
 * @param {Object?} [options] - Stringify settings.
 * @return {Compiler} - `self`.
 */
compilerPrototype.setOptions = function (options) {
    var self = this;
    var current = self.options;
    var ruleRepetition;
    var key;

    if (options === null || options === undefined) {
        options = {};
    } else if (typeof options === 'object') {
        options = clone(options);
    } else {
        raise(options, 'options');
    }

    for (key in defaultOptions) {
        validate[typeof current[key]](
            options, key, current[key], maps[key]
        );
    }

    ruleRepetition = options.ruleRepetition;

    if (ruleRepetition && ruleRepetition < MINIMUM_RULE_LENGTH) {
        raise(ruleRepetition, 'options.ruleRepetition');
    }

    self.options = options;

    return self;
};

/**
 * Visit a token.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.visit({
 *     type: 'strong',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '**Foo**'
 *
 * @param {Object} token - Node.
 * @param {Object?} [parent] - `token`s parent node.
 * @param {number?} [level=0] - `token`s nesting.
 * @return {string} - Compiled `token`.
 */
compilerPrototype.visit = function (token, parent, level) {
    var self = this;

    if (!level) {
        level = 0;
    }

    level += 1;

    if (typeof self[token.type] !== 'function') {
        self.file.fail(
            'Missing compiler for node of type `' +
            token.type + '`: ' + token,
            token
        );
    }

    return self[token.type](token, parent, level);
};

/**
 * Visit all tokens.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.all({
 *     type: 'strong',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     },
 *     {
 *       type: 'text',
 *       value: 'Bar'
 *     }]
 *   });
 *   // ['Foo', 'Bar']
 *
 * @param {Object} parent - Parent node of children.
 * @param {number} level - `parent`s nesting.
 * @return {Array.<string>} - List of compiled children.
 */
compilerPrototype.all = function (parent, level) {
    var self = this;
    var tokens = parent.children;
    var values = [];
    var index = -1;
    var length = tokens.length;

    while (++index < length) {
        values[index] = self.visit(tokens[index], parent, level);
    }

    return values;
};

/**
 * Visit ordered list items.
 *
 * Starts the list with
 * `token.start` and increments each following list item
 * bullet by one.
 *
 * Adds an extra line after an item if it has
 * `loose: true`.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.visitOrderedItems({
 *     type: 'list',
 *     ordered: true,
 *     children: [{
 *       type: 'listItem',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '1.  bar'
 *
 * @param {Object} token - `list` node with
 *   `ordered: true`.
 * @param {number} level - `token`s nesting.
 * @return {string} - Markdown list.
 */
compilerPrototype.visitOrderedItems = function (token, level) {
    var self = this;
    var values = [];
    var tokens = token.children;
    var index = -1;
    var length = tokens.length;
    var start = token.start;
    var bullet;
    var indent;
    var spacing;
    var value;

    level = level + 1;

    while (++index < length) {
        bullet = (start + index) + DOT + SPACE;

        indent = Math.ceil(bullet.length / INDENT) * INDENT;
        spacing = repeat(SPACE, indent - bullet.length);

        value = bullet + spacing +
            self.listItem(tokens[index], token, level, indent);

        if (tokens[index].loose && index !== length - 1) {
            value += LINE;
        }

        values[index] = value;
    }

    return values.join(LINE);
};

/**
 * Visit unordered list items.
 *
 * Uses `options.bullet` as each item's bullet.
 *
 * Adds an extra line after an item if it has
 * `loose: true`.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.visitUnorderedItems({
 *     type: 'list',
 *     ordered: false,
 *     children: [{
 *       type: 'listItem',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '-   bar'
 *
 * @param {Object} token - `list` node with
 *   `ordered: false`.
 * @param {number} level - `token`s nesting.
 * @return {string} - Markdown list.
 */
compilerPrototype.visitUnorderedItems = function (token, level) {
    var self = this;
    var values = [];
    var tokens = token.children;
    var index = -1;
    var length = tokens.length;
    var bullet;
    var spacing;
    var value;

    level = level + 1;

    /*
     * Unordered bullets are always one character, so
     * the following can be hard coded.
     */

    bullet = self.options.bullet + SPACE;
    spacing = repeat(SPACE, HALF);

    while (++index < length) {
        value = bullet + spacing +
            self.listItem(tokens[index], token, level, INDENT);

        if (tokens[index].loose && index !== length - 1) {
            value += LINE;
        }

        values[index] = value;
    }

    return values.join(LINE);
};

/**
 * Stringify a root.
 *
 * Knows about code following a list, or adjacent lists
 * with similar bullets, and places an extra newline
 * between them.
 *
 * Adds a final newline to ensure valid POSIX files.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.root({
 *     type: 'root',
 *     children: [{
 *       type: 'paragraph',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // 'bar'
 *
 * @param {Object} token - `root` node.
 * @param {Object} parent - Parent of `token` (weird,
 *   right?).
 * @param {number} level - `token`s nesting.
 * @return {string} - Markdown document.
 */
compilerPrototype.root = function (token, parent, level) {
    var self = this;
    var values = [];
    var tokens = token.children;
    var index = -1;
    var length = tokens.length;
    var child;
    var prev;

    while (++index < length) {
        child = tokens[index];

        if (prev) {
            /*
             * Duplicate tokens, such as a list
             * directly following another list,
             * often need multiple new lines.
             *
             * Additionally, code blocks following a list
             * might easily be mistaken for a paragraph
             * in the list itself.
             */

            if (child.type === prev.type && prev.type === 'list') {
                values.push(prev.ordered === child.ordered ? GAP : LINE);
            } else if (
                prev.type === 'list' &&
                child.type === 'code' &&
                !child.lang
            ) {
                values.push(GAP);
            } else {
                values.push(BREAK);
            }
        }

        values.push(self.visit(child, token, level));

        prev = child;
    }

    values = values.join(EMPTY);

    /*
     * Ensure the result is a valid POSIX file.
     */

    return values + LINE;
};

/**
 * Stringify a heading.
 *
 * In `setext: true` mode and when `depth` is smaller than
 * three, creates a setext header:
 *
 *     Foo
 *     ===
 *
 * Otherwise, an ATX header is generated:
 *
 *     ### Foo
 *
 * In `closeAtx: true` mode, the header is closed with
 * hashes:
 *
 *     ### Foo ###
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.heading({
 *     type: 'heading',
 *     depth: 2,
 *     children: [{
 *       type: 'strong',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '## **bar**'
 *
 * @param {Object} token - `heading` node.
 * @param {Object} parent - Parent of `token`.
 * @param {number} level - `token`s nesting.
 * @return {string} - Markdown heading.
 */
compilerPrototype.heading = function (token, parent, level) {
    var self = this;
    var setext = self.options.setext;
    var closeAtx = self.options.closeAtx;
    var depth = token.depth;
    var content = self.all(token, level).join(EMPTY);
    var prefix;

    if (setext && depth < 3) {
        return content + LINE +
            repeat(depth === 1 ? EQUALS : DASH, content.length);
    }

    prefix = repeat(HASH, token.depth);
    content = prefix + SPACE + content;

    if (closeAtx) {
        content += SPACE + prefix;
    }

    return content;
};

/**
 * Stringify text.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.text({
 *     type: 'text',
 *     value: 'foo'
 *   });
 *   // 'foo'
 *
 * @param {Object} token - `text` node.
 * @return {string} - Raw markdown text.
 */
compilerPrototype.text = function (token) {
    return token.value;
};

/**
 * Stringify escaped text.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.escape({
 *     type: 'escape',
 *     value: '\n'
 *   });
 *   // '\\\n'
 *
 * @param {Object} token - `escape` node.
 * @return {string} - Markdown escape.
 */
compilerPrototype.escape = function (token) {
    return '\\' + token.value;
};

/**
 * Stringify a paragraph.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.paragraph({
 *     type: 'paragraph',
 *     children: [{
 *       type: 'strong',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '**bar**'
 *
 * @param {Object} token - `paragraph` node.
 * @param {Object} parent - Parent of `token`.
 * @param {number} level - `token`s nesting.
 * @return {string} - Markdown paragraph.
 */
compilerPrototype.paragraph = function (token, parent, level) {
    return this.all(token, level).join(EMPTY);
};

/**
 * Stringify a block quote.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.paragraph({
 *     type: 'blockquote',
 *     children: [{
 *       type: 'paragraph',
 *       children: [{
 *         type: 'strong',
 *         children: [{
 *           type: 'text',
 *           value: 'bar'
 *         }]
 *       }]
 *     }]
 *   });
 *   // '> **bar**'
 *
 * @param {Object} token - `blockquote` node.
 * @param {Object} parent - Parent of `token`.
 * @param {number} level - `token`s nesting.
 * @return {string} - Markdown block quote.
 */
compilerPrototype.blockquote = function (token, parent, level) {
    var indent = ANGLE_BRACKET_CLOSE + SPACE;

    return indent + this.all(token, level).join(BREAK)
        .split(LINE).join(LINE + indent);
};

/**
 * Stringify a list. See `Compiler#visitOrderedList()` and
 * `Compiler#visitUnorderedList()` for internal working.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.visitUnorderedItems({
 *     type: 'list',
 *     ordered: false,
 *     children: [{
 *       type: 'listItem',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '-   bar'
 *
 * @param {Object} token - `list` node.
 * @param {Object} parent - Parent of `token`.
 * @param {number} level - `token`s nesting.
 * @return {string} - Markdown list.
 */
compilerPrototype.list = function (token, parent, level) {
    return this[ORDERED_MAP[token.ordered]](token, level);
};

/**
 * Stringify a list item.
 *
 * Prefixes the content with a checked checkbox when
 * `checked: true`:
 *
 *     [x] foo
 *
 * Prefixes the content with an unchecked checkbox when
 * `checked: false`:
 *
 *     [ ] foo
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.listItem({
 *     type: 'listItem',
 *     checked: true,
 *     children: [{
 *       type: 'text',
 *       value: 'bar'
 *     }]
 *   }, null, null, 4);
 *   '[x] bar'
 *
 * @param {Object} token - `listItem` node.
 * @param {Object} parent - Parent of `token`.
 * @param {number} level - `token`s nesting.
 * @param {number} padding - Indentation to use on
 *   subsequent lines.
 * @return {string} - Markdown list item (without bullet).
 */
compilerPrototype.listItem = function (token, parent, level, padding) {
    var self = this;
    var tokens = token.children;
    var values = [];
    var index = -1;
    var length = tokens.length;
    var value;

    while (++index < length) {
        values[index] = self.visit(tokens[index], token, level);
    }

    value = CHECKBOX_MAP[token.checked] +
        values.join(token.loose ? BREAK : LINE);

    value = pad(value, padding / INDENT);

    return value.slice(padding);
};

/**
 * Stringify inline code.
 *
 * Knows about internal ticks (`\``), and ensures one more
 * tick is used to enclose the inline code:
 *
 *     ```foo ``bar`` baz```
 *
 * Even knows about inital and final ticks:
 *
 *     `` `foo ``
 *     `` foo` ``
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.inlineCode({
 *     type: 'inlineCode',
 *     value: 'foo(); `bar`; baz()'
 *   });
 *   // '``foo(); `bar`; baz()``'
 *
 * @param {Object} token - `inlineCode` node.
 * @return {string} - Markdown inline code.
 */
compilerPrototype.inlineCode = function (token) {
    var value = token.value;
    var ticks = repeat(TICK, getLongestRepetition(value, TICK) + 1);
    var start = ticks;
    var end = ticks;

    if (value.charAt(0) === TICK) {
        start += SPACE;
    }

    if (value.charAt(value.length - 1) === TICK) {
        end = SPACE + end;
    }

    return start + token.value + end;
};

/**
 * Stringify YAML front matter.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.yaml({
 *     type: 'yaml',
 *     value: 'foo: bar'
 *   });
 *   // '---\nfoo: bar\n---'
 *
 * @param {Object} token - `yaml` node.
 * @return {string} - Markdown YAML document.
 */
compilerPrototype.yaml = function (token) {
    var delimiter = repeat(DASH, YAML_FENCE_LENGTH);
    var value = token.value ? LINE + token.value : EMPTY;

    return delimiter + value + LINE + delimiter;
};

/**
 * Stringify a code block.
 *
 * Creates indented code when:
 *
 * - No language tag exists;
 * - Not in `fences: true` mode;
 * - A non-empty value exists.
 *
 * Otherwise, GFM fenced code is created:
 *
 *     ```js
 *     foo();
 *     ```
 *
 * When in ``fence: `~` `` mode, uses tildes as fences:
 *
 *     ~~~js
 *     foo();
 *     ~~~
 *
 * Knows about internal fences (Note: GitHub/Kramdown does
 * not support this):
 *
 *     ````javascript
 *     ```markdown
 *     foo
 *     ```
 *     ````
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.code({
 *     type: 'code',
 *     lang: 'js',
 *     value: 'fooo();'
 *   });
 *   // '```js\nfooo();\n```'
 *
 * @param {Object} token - `code` node.
 * @return {string} - Markdown code block.
 */
compilerPrototype.code = function (token) {
    var value = token.value;
    var marker = this.options.fence;
    var fence;

    /*
     * Probably pedantic.
     */

    if (!token.lang && !this.options.fences && value) {
        return pad(value, 1);
    }

    fence = getLongestRepetition(value, marker) + 1;

    fence = repeat(marker, Math.max(fence, MINIMUM_CODE_FENCE_LENGTH));

    return fence + (token.lang || EMPTY) + LINE + value + LINE + fence;
};

/**
 * Stringify HTML.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.html({
 *     type: 'html',
 *     value: '<div>bar</div>'
 *   });
 *   // '<div>bar</div>'
 *
 * @param {Object} token - `html` node.
 * @return {string} - Markdown HTML.
 */
compilerPrototype.html = function (token) {
    return token.value;
};

/**
 * Stringify a horizontal rule.
 *
 * The character used is configurable by `rule`: (`'_'`)
 *
 *     ___
 *
 * The number of repititions is defined through
 * `ruleRepetition`: (`6`)
 *
 *     ******
 *
 * Whether spaces delimit each character, is configured
 * through `ruleSpaces`: (`true`)
 *
 *     * * *
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.horizontalRule({
 *     type: 'horizontalRule'
 *   });
 *   // '***'
 *
 * @return {string} - Markdown rule.
 */
compilerPrototype.horizontalRule = function () {
    var options = this.options;
    var rule = repeat(options.rule, options.ruleRepetition);

    if (options.ruleSpaces) {
        rule = rule.split(EMPTY).join(SPACE);
    }

    return rule;
};

/**
 * Stringify a strong.
 *
 * The marker used is configurable by `strong`, which
 * defaults to an asterisk (`'*'`) but also accepts an
 * underscore (`'_'`):
 *
 *     _foo_
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.strong({
 *     type: 'strong',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '**Foo**'
 *
 * @param {Object} token - `strong` node.
 * @param {Object} parent - Parent of `token`.
 * @param {number} level - `token`s nesting.
 * @return {string} - Markdown strong-emphasised text.
 */
compilerPrototype.strong = function (token, parent, level) {
    var marker = this.options.strong;

    marker = marker + marker;

    return marker + this.all(token, level).join(EMPTY) + marker;
};

/**
 * Stringify an emphasis.
 *
 * The marker used is configurable by `emphasis`, which
 * defaults to an underscore (`'_'`) but also accepts an
 * asterisk (`'*'`):
 *
 *     *foo*
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.emphasis({
 *     type: 'emphasis',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '_Foo_'
 *
 * @param {Object} token - `emphasis` node.
 * @param {Object} parent - Parent of `token`.
 * @param {number} level - `token`s nesting.
 * @return {string} - Markdown emphasised text.
 */
compilerPrototype.emphasis = function (token, parent, level) {
    var marker = this.options.emphasis;

    return marker + this.all(token, level).join(EMPTY) + marker;
};

/**
 * Stringify a hard break.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.break({
 *     type: 'break'
 *   });
 *   // '  \n'
 *
 * @return {string} - Hard markdown break.
 */
compilerPrototype.break = function () {
    return SPACE + SPACE + LINE;
};

/**
 * Stringify a delete.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.delete({
 *     type: 'delete',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // ''~~Foo~~'
 *
 * @param {Object} token - `delete` node.
 * @param {Object} parent - Parent of `token`.
 * @param {number} level - `token`s nesting.
 * @return {string} - Markdown strike-through.
 */
compilerPrototype.delete = function (token, parent, level) {
    return DOUBLE_TILDE + this.all(token, level).join(EMPTY) + DOUBLE_TILDE;
};

/**
 * Stringify a link.
 *
 * When no title exists and the compiled `children` equal
 * the `href`, an auto link is created:
 *
 *     <http://example.com>
 *
 * Otherwise, is smart about enclosing `href` (see
 * `encloseURI()`) and `title` (see `encloseTitle()`).
 *
 *    [foo](<foo at bar dot com> 'An "example" e-mail')
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.link({
 *     type: 'link',
 *     href: 'http://example.com',
 *     title: 'Example Domain',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '[Foo](http://example.com "Example Domain")'
 *
 * @param {Object} token - `link` node.
 * @param {Object} parent - Parent of `token`.
 * @param {number} level - `token`s nesting.
 * @return {string} - Markdown link.
 */
compilerPrototype.link = function (token, parent, level) {
    var self = this;
    var url = token.href;
    var value = self.all(token, level).join(EMPTY);

    if (token.title === null && (url === value || url === MAILTO + value)) {
        return encloseURI(url, true);
    }

    url = encloseURI(url);

    if (token.title) {
        url += SPACE + encloseTitle(token.title);
    }

    value = SQUARE_BRACKET_OPEN + value + SQUARE_BRACKET_CLOSE;

    value += PARENTHESIS_OPEN + url + PARENTHESIS_CLOSE;

    return value;
};

/**
 * Stringify a link label.
 *
 * Because link references are easily, mistakingly,
 * created (for example, `[foo]`), reference nodes have
 * an extra property depicting how it looked in the
 * original document, so stringification can cause minimal
 * changes.
 *
 * @example
 *   label({
 *     type: 'referenceImage',
 *     referenceType: 'full',
 *     identifier: 'foo'
 *   });
 *   // '[foo]'
 *
 *   label({
 *     type: 'referenceImage',
 *     referenceType: 'collapsed',
 *     identifier: 'foo'
 *   });
 *   // '[]'
 *
 *   label({
 *     type: 'referenceImage',
 *     referenceType: 'shortcut',
 *     identifier: 'foo'
 *   });
 *   // ''
 *
 * @param {Object} token - `linkReference` or
 *   `imageReference` node.
 * @return {string} - Markdown label reference.
 */
function label(token) {
    var value = '';
    var type = token.referenceType;

    if (type === 'full') {
        value = token.identifier;
    }

    if (type !== 'shortcut') {
        value = SQUARE_BRACKET_OPEN + value + SQUARE_BRACKET_CLOSE;
    }

    return value;
}

/**
 * Stringify a link reference.
 *
 * See `label()` on how reference labels are created.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.linkReference({
 *     type: 'linkReference',
 *     referenceType: 'collapsed',
 *     identifier: 'foo',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '[Foo][]'
 *
 * @param {Object} token - `linkReference` node.
 * @param {Object} parent - Parent of `token`.
 * @param {number} level - `token`s nesting.
 * @return {string} - Markdown link reference.
 */
compilerPrototype.linkReference = function (token, parent, level) {
    return SQUARE_BRACKET_OPEN +
        this.all(token, level).join(EMPTY) + SQUARE_BRACKET_CLOSE +
        label(token);
};

/**
 * Stringify an image reference.
 *
 * See `label()` on how reference labels are created.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.imageReference({
 *     type: 'imageReference',
 *     referenceType: 'full',
 *     identifier: 'foo',
 *     alt: 'Foo'
 *   });
 *   // '![Foo][foo]'
 *
 * @param {Object} token - `imageReference` node.
 * @return {string} - Markdown image reference.
 */
compilerPrototype.imageReference = function (token) {
    return EXCLAMATION_MARK +
        SQUARE_BRACKET_OPEN + token.alt + SQUARE_BRACKET_CLOSE +
        label(token);
};

/**
 * Stringify a footnote reference.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.footnoteReference({
 *     type: 'footnoteReference',
 *     identifier: 'foo'
 *   });
 *   // '[^foo]'
 *
 * @param {Object} token - `footnoteReference` node.
 * @return {string} - Markdown footnote reference.
 */
compilerPrototype.footnoteReference = function (token) {
    return SQUARE_BRACKET_OPEN + CARET + token.identifier +
        SQUARE_BRACKET_CLOSE;
};

/**
 * Stringify an link- or image definition.
 *
 * Is smart about enclosing `href` (see `encloseURI()`) and
 * `title` (see `encloseTitle()`).
 *
 *    [foo]: <foo at bar dot com> 'An "example" e-mail'
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.definition({
 *     type: 'definition',
 *     link: 'http://example.com',
 *     title: 'Example Domain',
 *     identifier: 'foo'
 *   });
 *   // '[foo]: http://example.com "Example Domain"'
 *
 * @param {Object} token - `definition` node.
 * @return {string} - Markdown link- or image definition.
 */
compilerPrototype.definition = function (token) {
    var value = SQUARE_BRACKET_OPEN + token.identifier + SQUARE_BRACKET_CLOSE;
    var url = encloseURI(token.link);

    if (token.title) {
        url += SPACE + encloseTitle(token.title);
    }

    return value + COLON + SPACE + url;
};

/**
 * Stringify an image.
 *
 * Is smart about enclosing `href` (see `encloseURI()`) and
 * `title` (see `encloseTitle()`).
 *
 *    ![foo](</fav icon.png> 'My "favourite" icon')
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.image({
 *     type: 'image',
 *     href: 'http://example.png/favicon.png',
 *     title: 'Example Icon',
 *     alt: 'Foo'
 *   });
 *   // '![Foo](http://example.png/favicon.png "Example Icon")'
 *
 * @param {Object} token - `image` node.
 * @return {string} - Markdown image.
 */
compilerPrototype.image = function (token) {
    var url = encloseURI(token.src);
    var value;

    if (token.title) {
        url += SPACE + encloseTitle(token.title);
    }

    value = EXCLAMATION_MARK + SQUARE_BRACKET_OPEN + (token.alt || EMPTY) +
        SQUARE_BRACKET_CLOSE;

    value += PARENTHESIS_OPEN + url + PARENTHESIS_CLOSE;

    return value;
};

/**
 * Stringify a footnote.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.footnote({
 *     type: 'footnote',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '[^Foo]'
 *
 * @param {Object} token - `footnote` node.
 * @param {Object} parent - Parent of `token`.
 * @param {number} level - `token`s nesting.
 * @return {string} - Markdown footnote.
 */
compilerPrototype.footnote = function (token, parent, level) {
    return SQUARE_BRACKET_OPEN + CARET + this.all(token, level).join(EMPTY) +
        SQUARE_BRACKET_CLOSE;
};

/**
 * Stringify a footnote definition.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.footnoteDefinition({
 *     type: 'footnoteDefinition',
 *     identifier: 'foo',
 *     children: [{
 *       type: 'paragraph',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '[^foo]: bar'
 *
 * @param {Object} token - `footnoteDefinition` node.
 * @return {string} - Markdown footnote definition.
 */
compilerPrototype.footnoteDefinition = function (token) {
    var id = token.identifier.toLowerCase();

    return SQUARE_BRACKET_OPEN + CARET + id +
        SQUARE_BRACKET_CLOSE + COLON + SPACE +
        this.all(token).join(BREAK + repeat(SPACE, INDENT));
};

/**
 * Stringify table.
 *
 * Creates a fenced table by default, but not in
 * `looseTable: true` mode:
 *
 *     Foo | Bar
 *     :-: | ---
 *     Baz | Qux
 *
 * NOTE: Be careful with `looseTable: true` mode, as a
 * loose table inside an indented code block on GitHub
 * renders as an actual table!
 *
 * Creates a spaces table by default, but not in
 * `spacedTable: false`:
 *
 *     |Foo|Bar|
 *     |:-:|---|
 *     |Baz|Qux|
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.table({
 *     type: 'table',
 *     align: ['center', null],
 *     children: [
 *       {
 *         type: 'tableHeader',
 *         children: [
 *           {
 *             type: 'tableCell'
 *             children: [{
 *               type: 'text'
 *               value: 'Foo'
 *             }]
 *           },
 *           {
 *             type: 'tableCell'
 *             children: [{
 *               type: 'text'
 *               value: 'Bar'
 *             }]
 *           }
 *         ]
 *       },
 *       {
 *         type: 'tableRow',
 *         children: [
 *           {
 *             type: 'tableCell'
 *             children: [{
 *               type: 'text'
 *               value: 'Baz'
 *             }]
 *           },
 *           {
 *             type: 'tableCell'
 *             children: [{
 *               type: 'text'
 *               value: 'Qux'
 *             }]
 *           }
 *         ]
 *       }
 *     ]
 *   });
 *   // '| Foo | Bar |\n| :-: | --- |\n| Baz | Qux |'
 *
 * @param {Object} token - `table` node.
 * @param {Object} parent - Parent of `token`.
 * @param {number} level - `token`s nesting.
 * @return {string} - Markdown table.
 */
compilerPrototype.table = function (token, parent, level) {
    var self = this;
    var loose = self.options.looseTable;
    var spaced = self.options.spacedTable;
    var rows = token.children;
    var index = rows.length;
    var result = [];
    var start;

    while (index--) {
        result[index] = self.all(rows[index], level);
    }

    start = loose ? EMPTY : spaced ? PIPE + SPACE : PIPE;

    return table(result, {
        'align': token.align,
        'start': start,
        'end': start.split(EMPTY).reverse().join(EMPTY),
        'delimiter': spaced ? SPACE + PIPE + SPACE : PIPE
    });
};

/**
 * Stringify a table cell.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.tableCell({
 *     type: 'tableCell',
 *     children: [{
 *       type: 'text'
 *       value: 'Qux'
 *     }]
 *   });
 *   // 'Qux'
 *
 * @param {Object} token - `tableCell` node.
 * @param {Object} parent - Parent of `token`.
 * @param {number} level - `token`s nesting.
 * @return {string} - Markdown table cell.
 */
compilerPrototype.tableCell = function (token, parent, level) {
    return this.all(token, level).join(EMPTY);
};

/**
 * Stringify an abstract syntax tree.
 *
 * @example
 *   stringify({
 *     type: 'strong',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   }, new File());
 *   // '**Foo**'
 *
 * @param {Object} ast - A node, most commonly, `root`.
 * @param {File} file - Virtual file.
 * @param {Object?} [options] - Passed to
 *   `Compiler#setOptions()`.
 * @return {string} - Markdown document.
 */
function stringify(ast, file, options) {
    var CustomCompiler = this.Compiler || Compiler;

    return new CustomCompiler(file, options).visit(ast);
}

/*
 * Expose `Compiler` on `stringify`.
 */

stringify.Compiler = Compiler;

/*
 * Expose `stringify` on `module.exports`.
 */

module.exports = stringify;
