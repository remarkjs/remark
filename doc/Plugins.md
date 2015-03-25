![mdast](https://cdn.rawgit.com/wooorm/mdast/master/logo.svg)

# Plugins

This page contains information on how **mdast** plugins work. It focusses on how to create plugins, rather than on how to implement them. To implement plugins, see [`mdast.use(plugin, options?)`](https://github.com/wooorm/mdast#mdastuseplugin-options).

## Table of Contents

*   [Plugin](#plugin)
    *   [function attacher(mdast, options?)](#function-attachermdast-options)
    *   [function transformer(ast, options, mdast)](#function-transformerast-options-mdast)

## Plugin

An **mdast** plugin does one or two things:

*   It modifies the instance: the parser and/or the stringifier;
*   It transforms the AST.

Both have their own function. The first is called an [“attacher”](#function-attachermdast-options). The second is named a [“transformer”](#function-pluginast-options-mdast). An “attacher” may return a “transformer”.

### function attacher([mdast](#api), options?)

To modify the parser (for an example, see [`test/mentions.js`](https://github.com/wooorm/mdast/blob/master/test/mentions.js)), create an attacher. An attacher is the thing passed to [`use`](https://github.com/wooorm/mdast#mdastuseplugin-options). It can receive plugin specific options, but that’s entirely up to the developer. An **attacher** is invoked when the plugin is first [`use`](https://github.com/wooorm/mdast#mdastuseplugin-options)d, and can return a transformer which will be called on subsequent [`mdast.parse()`](https://github.com/wooorm/mdast#mdastuseplugin-options)s or [`mdast.run()`](https://github.com/wooorm/mdast#mdastrunast-options)s.

**Signatures**

*   `transformer? = attacher(mdast, options?)`.

**Parameters**

*   `mdast` (`Object`) — Context on which the plugin was [`use`](https://github.com/wooorm/mdast#mdastuseplugin-options)d;
*   `options` (`Object?`) — Plugin specific options.

**Returns**

[`transformer`](#function-transformerast-options-mdast) (optional).

### function transformer([ast](doc/Nodes.md#node), [options](doc/Options.md#parse), [mdast](#api))

To transform an AST, create a transformer. A transformer is a simple function which is invoked each time a document is [`mdast.parse()`](https://github.com/wooorm/mdast#mdastuseplugin-options)d or [`mdast.run()`](https://github.com/wooorm/mdast#mdastrunast-options). A plugin should change the [AST](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#node) to add or remove nodes.

**Signatures**

*   `error? = plugin(ast, options, mdast)`.

**Parameters**

*   `ast` (`Object`) — An AST as returned by [`mdast.parse()`](#mdastparsevalue-options);
*   `options` (`Object`) — Options passed to [`mdast.parse()`](#mdastparsevalue-options) or [`mdast.run()`](#mdastrunast-options);
*   `mdast` (`Object`) — Context on which [`mdast.parse()`](#mdastparsevalue-options) or [`mdast.run()`](#mdastrunast-options) was invoked.

**Returns**

`Error` which will be thrown (optional).
