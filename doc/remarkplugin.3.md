# remarkplugin(3) -- remark plug-in creation

## SYNOPSIS

```js
/**
 * Change a file-extension to `'html'`.
 */
function transformer(ast, file) {
    file.move({
        'extension': 'html'
    });
}

/**
 * Expose.
 * This plugin can be used as `remark.use(plugin)`.
 */
module.exports = function () {
    return transformer;
};
```

## DESCRIPTION

This manual holds information on how **remark**(3) plugins work.  It
focuses on how to create plugins, rather than on how to use them. To
use plugins, see **remark**(3) and **remarkplugin**(7).

A **remark** plugin does up to three things:

*   It modifies the processor: the parser, the compiler;
*   It transforms the AST;
*   It adds new files to be processed by **remark**(1).

All have their own function. The first is called an
“attacher” (see **ATTACHER**). The second is named a
“transformer” (see **TRANSFORMER**). The third is named a
“completer” (see **COMPLETER**). An “attacher” may
return a “transformer” and attach a “completer”.

An attacher has access to the parser, which provides its own pluggable
interface, consisting of tokenizers (see **TOKENIZER**) and locators
(see **LOCATOR**).

## `function attacher(remark[, options][, fileSet])`

```js
/**
 * Add an extension.
 * The `processor` is the instance of remark this attacher
 * is `use`d on.
 * This plugin can be used as `remark.use(plugin, {ext: 'html'})`.
 */
module.exports = function (processor, options) {
    var extension = (options || {}).ext;

    /**
     * Change a file-extension to `extension`.
     */
    function transformer(ast, file) {
        file.move({
            'extension': extension
        });
    }

    return transformer;
};
```

To change the parser, the compiler, or access the file-set on **remark**(1),
create an attacher.

An attacher is the thing passed to `use()`. It can receive plugin specific
options, but that is entirely up to the developer. An **attacher** is invoked
when the plugin is `use`d on an **remark** instance, and can return a
**transformer** which will be called on further processes.

Note that **remark**(1) invokes **attacher** for each file, not just once.

**Signatures**:

*   `transformer? = attacher(remark, options[, fileSet])`.

**Parameters**:

*   `remark` (`Object`)
    — Context on which the plugin was `use`d;

*   `options` (`Object`, optional)
    — Plugin specific options;

*   `fileSet` (`FileSet`, optional)
    — Access to all files being processed by **remark**(1). Only passed on the
    Command-Line. See **remark**(3) for more information on file-sets.

**Returns**:

`transformer` (optional) — See FUNCTION TRANSFORMER(NODE, FILE\[, NEXT]).

## `function transformer(node, file[, next])`

```js
var visit = require('unist-util-visit');

/**
 * Add a `js` language flag to code nodes when without flag.
 */
function transformer(ast, file) {
    visit(ast, 'code', function (node) {
        if (!node.lang) {
            node.lang = 'js';
        }
    });
}

/**
 * Expose.
 * This plugin can be used as `remark.use(plugin)`.
 */
module.exports = function () {
    return transformer;
};
```

To transform an **mdast** node, create a **transformer**. A **transformer**
is a simple function which is invoked each time a document is processed by
a **remark** processor. A transformer should transform `node` or modify
`file`.

**Signatures**:

*   `err? = transformer(node, file, [next])`.

**Parameters**:

*   `node` (`Node`)
    — See **mdast**;

*   `file` (`VFile`)
    — Virtual file;

*   `next` (`function(err?)`, optional)
    — If the signature includes `node`, `file`, and `next`, `transformer`
    **may** finish asynchronous, and **must** invoke `next()` on completion
    with an optional error.

**Returns**:

`err` (`Error`, optional) — Exception which will be thrown.

## `function completer(fileSet[, next])`

To access all files once they are transformed, create a **completer**.
A **completer** is invoked before files are compiled, written, and logged, but
after reading, parsing, and transforming. Thus, a completer can still change
files or add messages.

**Signatures**:

*   `err? = completer(fileSet[, next])`.

**Properties**:

*   `pluginId` (`*`) — `attacher` is invoked for each file, so if it
    `use`s `completer` on the file-set, it would attach many times.
    By providing `pluginId` on `completer`, **remark** will make sure
    only one **completer** with that identifier is will be added.

**Parameters**:

*   `fileSet` (`FileSet`)
    — All files being processed by **remark**(1);

*   `next` (`function(err?)`, optional)
    — If the signature includes `fileSet` and `next`, `completer` **may**
    finish asynchronous, and **must** invoke `next()` on completion with an
    optional error.

**Returns**:

`err` (`Error`, optional) — Exception which will be thrown.

## `function tokenizer(eat, value, silent)`

```js
function mention(eat, value) {
    var match = /^@(\w+)/.exec(value);

    if (match) {
        if (silent) {
            return true;
        }

        return eat(match[0])({
            'type': 'link',
            'url': 'https://my-social-network/' + match[1],
            'children': [{
                'type': 'text',
                'value': match[0]
            }]
        });
    }
}
```

Most often, using transformers to manipulate a syntax-tree produces
the desired output.  Sometimes, mainly when needing to introduce new
syntactic entities with a certain level of precedence, interfacing with
the parser is necessary.  **remark** knows two types of tokenizers
based on the kinds of markdown nodes: block level (for example,
paragraphs or fenced code blocks) and inline level (for example,
emphasis or inline code spans).  Block level tokenizers are the same
as inline level tokenizers, with the exception that the latter must have
**locator** functions.

Tokenizers _test_ whether a document starts with a certain
syntactic entity.  When that occurs, they consume that token, a process which
is called “eating” in **remark**.  Locators enable tokenizers to function
faster by providing information on where the next entity occurs.

For a complete example, see
[`test/mentions.js`](https://github.com/wooorm/remark/blob/master/test/mentions.js)
and how it utilises and attaches a tokenizer and locator.

**Signatures**:

*   `Node? = transformer(eat, value)`;
*   `boolean? = transformer(eat, value, silent]`.

**Parameters**:

*   `eat` (`Function`)
    — Function used to eat, when applicable, an entity;

*   `value` (`string`)
    — Value which may start an entity;

*   `silent` (`boolean`, optional)
    — When `true`, instead of actually eating a value, the tokenizer must
    return whether a node can definitely be found at the start of `value`.

**Returns**:

In _normal_ mode, optionally an **mdast** node representing the eaten
entity.  Otherwise, in _silent_ mode, a truthy value must be returned when
the tokenizer predicts with certainty an entity could be found.

## `function locator(value, fromIndex)`

```js
function locator(value, fromIndex) {
    return value.indexOf('@', fromIndex);
}
```

As mentioned in the “tokenizer” section, locators are required for inline
tokenization to keep the process performant. Locators enable inline
tokenizers to function faster by providing information on the where
the next entity occurs.

**Signatures**:

*   `number = locator(value, fromIndex)`.

**Parameters**:

*   `value` (`string`)
    — Value which may contain an entity;

*   `fromIndex` (`number`)
    — Position to start searching at.

**Returns**:

The index at which the entity may start, and `-1` otherwise.

## BUGS

<https://github.com/wooorm/remark/issues>

## SEE ALSO

**remark**(1), **remark**(3), **remarkplugin**(7)

## Notes

See also <https://github.com/wooorm/mdast>.
