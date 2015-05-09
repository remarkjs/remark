![mdast](https://cdn.rawgit.com/wooorm/mdast/master/logo.svg)

# Plugins

## Table of Contents

*   [List of plugins](#list-of-plugins)
*   [Using Plugins](#using-plugins)
    *   [Programmatically](#programmatically)
    *   [CLI](#cli)
    *   [.mdastrc](#mdastrc)
*   [Creating Plugins](#creating-plugins)
    *   [Plugin](#plugin)
        *   [function attacher(mdast, options?)](#function-attachermdast-options)
        *   [function transformer(ast, file, next?)](#function-transformerast-file-next)
    *   [Publishing](#publishing)

## List of plugins

*   [wooorm/mdast-comment-config](https://github.com/wooorm/mdast-comment-config) — Set settings with comments during runtime;
*   [wooorm/mdast-github](https://github.com/wooorm/mdast-github) — Auto-link references like in GitHub issues, PRs, and comments;
*   [wooorm/mdast-heading](https://github.com/wooorm/mdast-heading) — Markdown heading as ranges;
*   [wooorm/mdast-range](https://github.com/wooorm/mdast-range) — Add range information;
*   [wooorm/mdast-toc](https://github.com/wooorm/mdast-toc) — Generate a Table of Contents (TOC) for Markdown files;
*   [wooorm/mdast-usage](https://github.com/wooorm/mdast-usage) — Add a usage example to your readme;
*   [wooorm/mdast-yaml](https://github.com/wooorm/mdast-yaml) — Parse and stringify YAML code blocks;
*   [wooorm/mdast-yaml-config](https://github.com/wooorm/mdast-yaml-config) — Set settings with YAML during runtime;
*   [wooorm/mdast-zone](https://github.com/wooorm/mdast-zone) — HTML comments as ranges or markers.

## Using Plugins

This section contains information on how to use **mdast** plugins. To create plugins, see [below](#creating-plugins).

### Programmatically

To use plugins in **mdast**(3), the JavaScript API, pass a plugin to `mdast.use(plugin, options)`.

See [`man 3 mdast`](https://github.com/wooorm/mdast/blob/master/doc/mdast.3.md#mdastuseplugin-options) for more information.

### CLI

To use plugins from the CLI, use the `--use` key (short: `-u`), which can be passed a single npm plugin, or a path to any CommonJS JavaScript file which exposes a plugin.
When referencing an npm plugin, and the plugin’s name is prefixed by `mdast-`, this prefix can be omitted.

To pass options, follow the plugin’s location by an equals sign (`=`), which is then followed by settings. For example, `--use toc=heading:contents`.

Each setting is delimited by a comma or a semi-colon, and each key is seperated with a colon from its value.

See [`man 1 mdast`](https://github.com/wooorm/mdast/blob/master/doc/mdast.1.md) for more information.

### .mdastrc

`.mdastrc`, and `package.json` files can declare which plugins should be used by including either a list of plugins or a map of plugin–options pairs on a `plugins` field in the exposed object.
When referencing an npm plugin, and the plugin’s name is prefixed by `mdast-`, this prefix can be omitted.

For example, the following `.mdastrc` file will use [**mdast-github**](https://www.npmjs.com/package/mdast-github):

```json
{
  "plugins": [
    "github"
  ]
}
```

The below `.mdastrc` file does the same, but additionally provides options to the plugin:

```json
{
  "plugins": {
    "github": {
      "repository": "foo/bar"
    }
  }
}
```

See [`man 5 mdastrc`](https://github.com/wooorm/mdast/blob/master/doc/mdastrc.5.md) for more information.

## Creating Plugins

This section contains information on how **mdast** plugins work. It focusses on how to create plugins, rather than on how to implement them. To implement plugins, see [above](#using-plugins).

### Plugin

An **mdast** plugin does one or two things:

*   It modifies the instance: the parser and/or the stringifier;
*   It transforms the AST.

Both have their own function. The first is called an [“attacher”](#function-attachermdast-options). The second is named a [“transformer”](#function-transformerast-file-next). An “attacher” may return a “transformer”.

#### function attacher([mdast](https://github.com/wooorm/mdast#api), options?)

To modify the parser (for an example, see [`test/mentions.js`](https://github.com/wooorm/mdast/blob/master/test/mentions.js)), create an attacher. An attacher is the thing passed to [`use`](https://github.com/wooorm/mdast#mdastuseplugin-options). It can receive plugin specific options, but that’s entirely up to the developer. An **attacher** is invoked when the plugin is first [`use`](https://github.com/wooorm/mdast#mdastuseplugin-options)d, and can return a transformer which will be called on subsequent [`mdast.process()`](https://github.com/wooorm/mdast#mdastprocessvalue-options-done)s or [`mdast.run()`](mdast.3.md#mdastrunast-file-done)s.

**Signatures**

*   `transformer? = attacher(mdast, options?)`.

**Parameters**

*   `mdast` (`Object`) — Context on which the plugin was [`use`](https://github.com/wooorm/mdast#mdastuseplugin-options)d;
*   `options` (`Object?`) — Plugin specific options.

**Returns**

[`transformer`](#function-transformerast-file-next) (optional).

#### function transformer([ast](https://github.com/wooorm/mdast/blob/master/doc/nodes.md#node), [file](mdast.3.md#file), next?)

To transform an AST, create a transformer. A transformer is a simple function which is invoked each time a document is [`mdast.process()`](https://github.com/wooorm/mdast#mdastprocessvalue-options-done)d or [`mdast.run()`](mdast.3.md#mdastrunast-file-done). A transformer should change the [AST](https://github.com/wooorm/mdast/blob/master/doc/nodes.md#node) or [file](mdast.3.md#file) to add or remove nodes.

**Signatures**

*   `err? = plugin(ast, file)`.
*   `err? = plugin(ast, file, next)`.

**Parameters**

*   `ast` (`Object`) — An AST as returned by [`mdast.parse()`](mdast.3.md#mdastparsefile-options);
*   `file` (`File`) — [File](mdast.3.md#file) object.
*   `next` (`function(err?)`, optional) — If the signature includes both `ast` and `next`, `transformer` **may** finish asynchronous, and **must** invoke `next(Error?)` on completion.

**Returns**

`err` (`Error`, optional) — Exception which will be thrown.

### Publishing

It is recommended to publish a plugin as an [npm module](https://docs.npmjs.com/getting-started/publishing-npm-packages).
You should pick a name prefixed by `"mdast-"`, valid examples are [**mdast-toc**](https://www.npmjs.com/package/mdast-toc) or [**mdast-yaml-config**](https://www.npmjs.com/package/mdast-yaml-config).
Additionally, when the library could be used in the browser, I recommend publishing to [Bower](http://bower.io/docs/creating-packages/) and [Component](https://github.com/componentjs/guide/blob/master/creating-components/publishing.md).

When publishing a plugin, you should utilise the package manager’s keywords functionality and include `"mdast"` in the list.
