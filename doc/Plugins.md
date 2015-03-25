![mdast](https://cdn.rawgit.com/wooorm/mdast/master/logo.svg)

# Plugins

This page contains information on how **mdast** plugins work. It focusses on how to create plugins, rather than on how to implement them. To implement plugins, see [`mdast.use(plugin, options?)`](../Readme.md#mdastuseplugin-options).

## Table of Contents

*   [Plugin](#plugin)
    *   [function attacher(mdast, options?)](#function-attachermdast-options)
    *   [function transformer(ast, options, mdast)](#function-transformerast-options-mdast)

## Plugin

An **mdast** plugin does one or two things:

*   It modifies the instance: the parser and/or the stringifier;
*   It transforms the AST.

Both have their own function. The first is called an [“attacher”](#function-attachermdast-options). The second is named a [“transformer”](#function-transformerast-options-mdast). An “attacher” may return a “transformer”.

### function attacher([mdast](../Readme.md#api), options?)

To modify the parser (for an example, see [`test/mentions.js`](../test/mentions.js)), create an attacher. An attacher is the thing passed to [`use`](../Readme.md#mdastuseplugin-options). It can receive plugin specific options, but that’s entirely up to the developer. An **attacher** is invoked when the plugin is first [`use`](../Readme.md#mdastuseplugin-options)d, and can return a transformer which will be called on subsequent [`mdast.parse()`](../Readme.md#mdastparsevalue-options)s or [`mdast.run()`](../Readme.md#mdastrunast-options)s.

**Signatures**

*   `transformer? = attacher(mdast, options?)`.

**Parameters**

*   `mdast` (`Object`) — Context on which the plugin was [`use`](../Readme.md#mdastuseplugin-options)d;
*   `options` (`Object?`) — Plugin specific options.

**Returns**

[`transformer`](#function-transformerast-options-mdast) (optional).

### function transformer([ast](../doc/Nodes.md#node), [options](../doc/Options.md#parse), [mdast](../Readme.md#api))

To transform an AST, create a transformer. A transformer is a simple function which is invoked each time a document is [`mdast.parse()`](../Readme.md#mdastparsevalue-options)d or [`mdast.run()`](../Readme.md#mdastrunast-options). A plugin should change the [AST](../doc/Nodes.md#node) to add or remove nodes.

**Signatures**

*   `Error? = plugin(ast, options, mdast)`.

**Parameters**

*   `ast` (`Object`) — An AST as returned by [`mdast.parse()`](../Readme.md#mdastparsevalue-options);
*   `options` (`Object`) — Options passed to [`mdast.parse()`](../Readme.md#mdastparsevalue-options) or [`mdast.run()`](../Readme.md#mdastrunast-options);
*   `mdast` (`Object`) — Context on which [`mdast.parse()`](../Readme.md#mdastparsevalue-options) or [`mdast.run()`](../Readme.md#mdastrunast-options) was invoked.

**Returns**

`Error` which will be thrown (optional).
