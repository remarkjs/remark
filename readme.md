# ![mdast](https://cdn.rawgit.com/wooorm/mdast/master/logo.svg)

[![Build Status](https://img.shields.io/travis/wooorm/mdast.svg)](https://travis-ci.org/wooorm/mdast) [![Coverage Status](https://img.shields.io/codecov/c/github/wooorm/mdast.svg)](https://codecov.io/github/wooorm/mdast) [![Inline docs](https://img.shields.io/badge/docs-A-brightgreen.svg)](http://inch-ci.org/github/wooorm/mdast)

**mdast** is a markdown processor powered by plugins. Lots of tests. Node,
io.js, and the browser. 100% coverage.

**mdast** is not just another markdown to HTML compiler. It can generate,
and reformat, markdown too. It is powered by [plugins](doc/plugins.md) to do
all kinds of things: [validate your markdown](https://github.com/wooorm/mdast-lint),
[add links for GitHub references](https://github.com/wooorm/mdast-github), or
[add a table of contents](https://github.com/wooorm/mdast-toc).

The project contains both an extensive [JavaScript API](doc/mdast.3.md) for
parsing, modifying, and compiling markdown, and a friendly [Command Line
Interface](doc/mdast.1.md) making it easy to validate, prepare, and compile
markdown in a build step.

## Table of Contents

*   [Installation](#installation)

*   [Usage](#usage)

*   [API](#api)

    *   [mdast.process(value, options?, done?)](#mdastprocessvalue-options-done)
    *   [mdast.use(plugin, options?)](#mdastuseplugin-options)

*   [CLI](#cli)

*   [License](#license)

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
npm install mdast
```

[Read more about alternatives ways to install and use »](doc/installation.md)

## Usage

Load dependencies:

```javascript
var mdast = require('mdast');
var html = require('mdast-html');
var yamlConfig = require('mdast-yaml-config');
```

Use plugins:

```javascript
var processor = mdast().use(yamlConfig).use(html);
```

Process the document:

```javascript
var doc = processor.process([
    '---',
    'mdast:',
    '  commonmark: true',
    '---',
    '',
    '2) Some *emphasis*, **strongness**, and `code`.'
].join('\n'));
```

Yields:

```html
<ol start="2">
<li>Some <em>emphasis</em>, <strong>strongness</strong>, and <code>code</code>.</li>
</ol>
```

## API

[**Get Started with the API** »](doc/getting-started.md#application-programming-interface)

### [mdast](#api).process(value, [options](doc/mdastsetting.7.md)?, done?)

Parse a markdown document, apply plugins to it, and compile it into
something else.

**Signatures**

*   `doc = mdast.process(value, options?, done?)`.

**Parameters**

*   `value` (`string`) — Markdown document;

*   `options` (`Object`) — Settings:

    *   `gfm` (`boolean`, default: `true`) — See [GitHub Flavoured Markdown](doc/mdastsetting.7.md#github-flavoured-markdown);
    *   `yaml` (`boolean`, default: `true`) — See [YAML](doc/mdastsetting.7.md#yaml);
    *   `commonmark` (`boolean`, default: `false`) — See [CommonMark](doc/mdastsetting.7.md#commonmark);
    *   `footnotes` (`boolean`, default: `false`) — See [Footnotes](doc/mdastsetting.7.md#footnotes);
    *   `pedantic` (`boolean`, default: `false`) — See [Pedantic](doc/mdastsetting.7.md#pedantic);
    *   `breaks` (`boolean`, default: `false`) — See [Breaks](doc/mdastsetting.7.md#breaks);
    *   `entities` (`boolean`, default: `false`) — See [Encoding Entities](doc/mdastsetting.7.md#encoding-entities);
    *   `setext` (`boolean`, default: `false`) — See [Setext Headings](doc/mdastsetting.7.md#setext-headings);
    *   `closeAtx` (`boolean`, default: `false`) — See [Closed ATX Headings](doc/mdastsetting.7.md#closed-atx-headings);
    *   `looseTable` (`boolean`, default: `false`) — See [Loose Tables](doc/mdastsetting.7.md#loose-tables);
    *   `spacedTable` (`boolean`, default: `true`) — See [Spaced Tables](doc/mdastsetting.7.md#spaced-tables);
    *   `fence` (`"~"` or ``"`"``, default: ``"`"``) — See [Fence](doc/mdastsetting.7.md#fence);
    *   `fences` (`boolean`, default: `false`) — See [Fences](doc/mdastsetting.7.md#fences);
    *   `bullet` (`"-"`, `"*"`, or `"+"`, default: `"-"`) — See [List Item Bullets](doc/mdastsetting.7.md#list-item-bullets);
    *   `listItemIndent` (`"tab"`, `"mixed"` or `"1"`, default: `"tab"`) — See [List Item Indent](doc/mdastsetting.7.md#list-item-indent);
    *   `incrementListMarker` (`boolean`, default: `true`) — See [List Marker Increase](doc/mdastsetting.7.md#list-marker-increase);
    *   `rule` (`"-"`, `"*"`, or `"_"`, default: `"*"`) — See [Horizontal Rules](doc/mdastsetting.7.md#horizontal-rules);
    *   `ruleRepetition` (`number`, default: `3`) — See [Horizontal Rules](doc/mdastsetting.7.md#horizontal-rules);
    *   `ruleSpaces` (`boolean`, default `true`) — See [Horizontal Rules](doc/mdastsetting.7.md#horizontal-rules);
    *   `strong` (`"_"`, or `"*"`, default `"*"`) — See [Emphasis Markers](doc/mdastsetting.7.md#emphasis-markers);
    *   `emphasis` (`"_"`, or `"*"`, default `"_"`) — See [Emphasis Markers](doc/mdastsetting.7.md#emphasis-markers).
    *   `position` (`boolean`, default: `true`) — See [Position](doc/mdastsetting.7.md#position);

*   `done` (`function(Error?, string?)`) — Callback invoked when the output
    is generated with either an error, or a result. Only strictly needed when
    asynchronous plugins are used.

All options (including the options object itself) can be `null` or `undefined`
to default to their default values.

**Returns**

`string` or `null`: A document. Formatted in markdown by default, or in
whatever a plugin generates.
The result is `null` if a plugin is asynchronous, in which case the callback
`done` should’ve been passed (do not worry: plugin creators make sure you know
its asynchronous).

### [mdast](#api).use([plugin](doc/plugins.md#plugins), options?)

Change the way [`mdast`](#api) works by using a [`plugin`](doc/plugins.md).

**Signatures**

*   `processor = mdast.use(plugin, options?)`;
*   `processor = mdast.use(plugins)`.

**Parameters**

*   `plugin` (`Function`) — A [**Plugin**](doc/plugins.md);
*   `plugins` (`Array.<Function>`) — A list of [**Plugin**](doc/plugins.md)s;
*   `options` (`Object?`) — Passed to plugin. Specified by its documentation.

**Returns**

`Object`: an instance of MDAST: The returned object functions just like
**mdast** (it has the same methods), but caches the `use`d plugins. This
provides the ability to chain `use` calls to use multiple plugins, but
ensures the functioning of the **mdast** module does not change for other
dependents.

## CLI

[**Get Started with the CLI** »](doc/getting-started.md#command-line-interface)

Install:

```bash
npm install --global mdast
```

Use:

```text
Usage: mdast [options] <file|dir ...>

Markdown processor powered by plugins

Options:

  -h, --help                output usage information
  -V, --version             output the version number
  -o, --output [path]       specify output location
  -c, --config-path <path>  specify configuration location
  -i, --ignore-path <path>  specify ignore location
  -s, --setting <settings>  specify settings
  -u, --use <plugins>       use transform plugin(s)
  -e, --ext <extensions>    specify extensions
  -w, --watch               watch for changes and reprocess
  -a, --ast                 output AST information
  -q, --quiet               output only warnings and errors
  -S, --silent              output only errors
  -f, --frail               exit with 1 on warnings
  --file-path <path>        specify file path to process as
  --no-stdout               disable writing to stdout
  --no-color                disable color in output
  --no-rc                   disable configuration from .mdastrc
  --no-ignore               disable ignore from .mdastignore

Usage:

# Process `readme.md`
$ mdast readme.md -o readme-new.md

# Pass stdin through mdast, with settings, to stdout
$ mdast -s "setext: true, bullet: \"*\"" < readme.md > readme-new.md

# Use a plugin (with options)
$ npm install mdast-toc
$ mdast --use toc=heading:"contents" readme.md -o

# Rewrite markdown in a directory
$ mdast . -o

See also: man 1 mdast, man 3 mdast, man 3 mdastplugin,
  man 5 mdastrc, man 5 mdastignore, man 7 mdastsetting,
  man 7 mdastconfig, man 7 mdastnode, man 7 mdastplugin.
```

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)

> This project was initially a fork of [marked](https://github.com/chjj/marked).

Copyright (c) 2011-2014, Christopher Jeffrey. (MIT License)
