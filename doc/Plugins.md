![mdast](https://cdn.rawgit.com/wooorm/mdast/master/logo.svg)

# Plugins

This page contains information on how **mdast** plugins work. It focusses on how to create plugins, rather than on how to implement them. To implement plugins, see [`mdast.use(plugin, options?)`](https://github.com/wooorm/mdast#mdastuseplugin-options).

## Table of Contents

*   [Plugin](#plugin)
    *   [function attacher(mdast, options?)](#function-attachermdast-options)
    *   [function transformer(ast, file, next?)](#function-transformerast-file-next)

## Plugin

An **mdast** plugin does one or two things:

*   It modifies the instance: the parser and/or the stringifier;
*   It transforms the AST.

Both have their own function. The first is called an [“attacher”](#function-attachermdast-options). The second is named a [“transformer”](#function-transformerast-file-next). An “attacher” may return a “transformer”.

### function attacher([mdast](https://github.com/wooorm/mdast#api), options?)

To modify the parser (for an example, see [`test/mentions.js`](https://github.com/wooorm/mdast/blob/master/test/mentions.js)), create an attacher. An attacher is the thing passed to [`use`](https://github.com/wooorm/mdast#mdastuseplugin-options). It can receive plugin specific options, but that’s entirely up to the developer. An **attacher** is invoked when the plugin is first [`use`](https://github.com/wooorm/mdast#mdastuseplugin-options)d, and can return a transformer which will be called on subsequent [`mdast.process()`](https://github.com/wooorm/mdast#mdastprocessvalue-options-done)s or [`mdast.run()`](mdast.3.md#mdastrunast-file-done)s.

**Signatures**

*   `transformer? = attacher(mdast, options?)`.

**Parameters**

*   `mdast` (`Object`) — Context on which the plugin was [`use`](https://github.com/wooorm/mdast/blob/master#mdastuseplugin-options)d;
*   `options` (`Object?`) — Plugin specific options.

**Returns**

[`transformer`](#function-transformerast-file-next) (optional).

### function transformer([ast](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#node), [file](mdast.3.md#file), next?)

To transform an AST, create a transformer. A transformer is a simple function which is invoked each time a document is [`mdast.process()`](https://github.com/wooorm/mdast#mdastprocessvalue-options-done)d or [`mdast.run()`](mdast.3.md#mdastrunast-file-done). A transformer should change the [AST](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#node) or [file](mdast.3.md#file) to add or remove nodes.

**Signatures**

*   `err? = plugin(ast, file)`.
*   `err? = plugin(ast, file, next)`.

**Parameters**

*   `ast` (`Object`) — An AST as returned by [`mdast.parse()`](mdast.3.md#mdastparsefile-options);
*   `file` (`File`) — [File](mdast.3.md#file) object.
*   `next` (`function(err?)`, optional) — If the signature includes both `ast` and `next`, `transformer` **may** finish asynchronous, and **must** invoke `next(Error?)` on completion.

**Returns**

`err` (`Error`, optional) — Exception which will be thrown.
