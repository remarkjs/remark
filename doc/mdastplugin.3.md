# mdastplugin(3) -- mdast plug-in creation

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
 * This plugin can be used as `mdast.use(plugin)`.
 */
module.exports = function () {
    return transformer;
};
```

## DESCRIPTION

This manual contains information on how **mdast**(3) plugins work.  It
focusses on how to create plugins, rather than on how to implement them. To
implement plugins, see **mdast**(3) and **mdastplugin**(7).

An **mdast** plugin does up to three things:

*   It modifies the processor: the parser, the stringifier;
*   It transforms the AST;
*   It adds new files to be processed by **mdast**(1).

All have their own function. The first is called an
“attacher” (see **ATTACHER**). The second is named a
“transformer” (see **TRANSFORMER**). The third is named a
“completer” (see **COMPLETER**). An “attacher” may
return a “transformer” and attach a “completer”.

## function attacher(mdast\[, options\]\[, fileSet\])

```js
/**
 * Add an extension.
 * The `processor` is the instance of mdast this attacher
 * is `use`d on.{
 * This plugin can be used as `mdast.use(plugin, {ext: 'html'})`.
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

To modify the parser, the compiler, or access the file-set on **mdast**(1),
create an attacher.

An attacher is the thing passed to `use()`. It can receive plugin specific
options, but that’s entirely up to the developer. An **attacher** is invoked
when the plugin is `use`d on an **mdast** instance, and can return a
**transformer** which will be called on subsequent processes.

Note that **mdast**(1) invokes **attacher** for each file, not just once.

**Signatures**

*   `transformer? = attacher(mdast, options[, fileSet])`.

**Parameters**

*   `mdast` (`Object`)
    — Context on which the plugin was `use`d;

*   `options` (`Object`, optional)
    — Plugin specific options;

*   `fileSet` (`FileSet`, optional)
    — Access to all files being processed by **mdast**(1). Only passed on the
    Command-Line.

**Returns**

`transformer` (optional) — See FUNCTION TRANSFORMER(NODE, FILE\[, NEXT\]).

## function transformer(node, file\[, next\])

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
 * This plugin can be used as `mdast.use(plugin)`.
 */
module.exports = function () {
    return transformer;
};
```

To transform an **mdastnode**(7), create a **transformer**. A **transformer**
is a simple function which is invoked each time a document is processed by
a **mdast** processor. A transformer should transform `node` or modify `file`.

**Signatures**

*   `err? = transformer(node, file, [next])`.

**Parameters**

*   `node` (`Node`)
    — See **mdastnode**(7);

*   `file` (`VFile`)
    — Virtual file;

*   `next` (`function(err?)`, optional)
    — If the signature includes `node`, `file`, and `next`, `transformer`
    **may** finish asynchronous, and **must** invoke `next()` on completion
    with an optional error.

**Returns**

`err` (`Error`, optional) — Exception which will be thrown.

## function completer(fileSet\[, next\])

To access all files once they are transformed, create a **completer**.
A **completer** is invoked before files are compiled, written, and logged, but
after reading, parsing, and transforming. Thus, a completer can still change
files or add messages.

**Signatures**

*   `err? = completer(fileSet[, next])`.

**Properties**

*   `pluginId` (`*`) — `attacher` is invoked for each file, so if it
    `use`s `completer` on the file-set, it would attach multiple times.
    By providing `pluginId` on `completer`, **mdast** will ensure only one
    **completer** with that identifier is will be added.

**Parameters**

*   `fileSet` (`FileSet`)
    — All files being processed by **mdast**(1);

*   `next` (`function(err?)`, optional)
    — If the signature includes `fileSet` and `next`, `completer` **may**
    finish asynchronous, and **must** invoke `next()` on completion with an
    optional error.

**Returns**

`err` (`Error`, optional) — Exception which will be thrown.

### mdast.use(plugin\[, options\])

Change the way **mdast** works by using a plugin.  Plugins are documented
at <https://github.com/wooorm/mdast/blob/master/doc/plugins.md>.

**Signatures**

*   `processor = mdast.use(plugin[, options])`;
*   `processor = mdast.use(plugins)`.

**Parameters**

*   `plugin` (`Function`) — Plugin.
*   `plugins` (`Array.<Function>`) — List of plugins.
*   `options` (`Object?`) — Passed to plugin.  Specified by its documentation.

**Returns**

`Object` — An instance of **mdast**.  The instance functions just like the
**mdast** library itself (it has the same methods), but caches the `use`d
plugins.

### mdast.parse(file\[, options\])

Parse a markdown document into an **mdastnode**(7).

**Signatures**

*   `node = mdast.parse(file|value[, options])`.

**Parameters**

*   `file` (`VFile`) — Virtual file;
*   `value` (`string`) — String representation of a file;
*   `options` (`Object`) — Configuration given to the parser.

**Returns**

`Node` — Node.  Nodes are documented at **mdastnode**(7).

### mdast.run(node\[, file\]\[, done\])

Transform a node by applying plug-ins to it. Either a node or a file which
was previously passed to `parse()`, must be given.

**Signatures**

*   `node = mdast.run(node[, file|value][, done])`;
*   `node = mdast.run(file[, done])`.

**Parameters**

*   `node` (`Object`) — Node as returned by `parse()`, see **mdastnode**(7);

*   `file` (`VFile`) — Virtual file;

*   `value` (`string`) — String representation of a file;

*   `done` (`function done(err, node, file)`)
    — See FUNCTION DONE(ERR, NODE, FILE).

**Returns**

`Node` — The given node.

**Throws**

When no `node` was given and no node was found on the file.

#### function done(err, node, file)

Invoked when transformation is complete.

**Signatures**

*   `function done(err)`;
*   `function done(null, node, file)`.

**Parameters**

*   `err` (`Error`) — Failure;
*   `node` (`Node`) — Transformed node;
*   `file` (`File`) — File object representing the input file;

### mdast.stringify(node\[, file\]\[, options\])

Compile a node into a document.

**Signatures**

*   `doc = mdast.stringify(node[, file|value][, options])`;
*   `doc = mdast.stringify(file[, options])`.

**Parameters**

*   `node` (`Object`) — Node as returned by `parse()`, see **mdastnode**(7);
*   `file` (`VFile`) — Virtual file;
*   `value` (`string`) — String representation of a file;
*   `options` (`Object`) — Configuration.

**Returns**

`doc` (`string`) — Document.

**Throws**

When no `node` was given and no node was found on the file.

### mdast.process(file\[, options\]\[, done\])

Parse, transform, and compile markdown into something else.

**Signatures**

*   `doc? = mdast.process(file|value[, options][, done])`.

**Parameters**

*   `file` (`File`) — Virtual file;
*   `value` (`string`) — Source of a (virtual) file;
*   `options` (`Object`) — Settings.  See **mdastsetting**(7);
*   `done` (`function done(err?, doc?, file?)`.

**Returns**

`string?` — Document.  Formatted in markdown by default, or in whatever a
plugin generates. When an async transformer is used, `null` is returned and
`done` must be given to receive the results upon completion.

#### function done(err?, doc?, file?)

Invoked when processing is complete.

**Signatures**

*   `function done(err)`;
*   `function done(null, doc, file)`.

**Parameters**

*   `err` (`Error`) — Failure;
*   `doc` (`string`) — Document generated by the process;
*   `file` (`File`) — File object representing the input file;

### FileSet()

**mdast**(1) compiles multiple files using a `FileSet` instance.  This set
is exposed to plug-ins as an argument to the attacher. `FileSet`s
should not be created by plug-ins. See FILESET in **mdast**(3) for more
information.

### File#valueOf()

### File#toJSON()

Get access to the file objects in a set.

**Signatures**

*   `files = fileSet.valueOf()`.

**Returns**

`Array.<File>` — List of files being processed by **mdast**(1).

### FileSet#use(completer)

Add a completer to the middleware pipeline of a file-set.  When all
files are transformed, this pipeline is run and `completer` is invoked
with `fileSet`.

**Signatures**

*   `fileSet.use(completer)`.

**Parameters**

*   `completer` (`Function`).

### FileSet#add(file|filePath)

Add a new file to be processed by **mdast**(1). The given file is
processed just like other files, with a few differences.

Programmatically added files are:

*   Ignored when their file-path is already added;
*   Never written to the file-system;
*   Not logged about.

**Signatures**

*   `fileSet.use(filePath)`;
*   `fileSet.use(file)`.

**Parameters**

*   `filePath` (`string`) - Path to virtual file;
*   `file` (`File`) - Virtual file.

## BUGS

<https://github.com/wooorm/mdast/issues>

## SEE ALSO

**mdast**(1), **mdast**(3), **mdastplugin**(7), **mdastnode**(7).

## AUTHOR

Written by Titus Wormer <mailto:tituswormer@gmail.com>
