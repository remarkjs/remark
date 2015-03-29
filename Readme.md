# ![mdast](https://cdn.rawgit.com/wooorm/mdast/master/logo.svg)

[![Build Status](https://img.shields.io/travis/wooorm/mdast.svg?style=flat)](https://travis-ci.org/wooorm/mdast) [![Coverage Status](https://img.shields.io/coveralls/wooorm/mdast.svg?style=flat)](https://coveralls.io/r/wooorm/mdast?branch=master)

**mdast** is a markdown parser and stringifier for multipurpose analysis in JavaScript. Node and the browser. Lots of tests. 100% coverage.

It’s not [just](https://github.com/evilstreak/markdown-js) [another](https://github.com/chjj/marked) [markdown](https://github.com/jonschlinkert/remarkable) [to](https://github.com/jgm/commonmark.js) [HTML](https://github.com/markdown-it/markdown-it) compiler. **mdast** can generate markdown too, which enables plug-ins (and you) to [change your Readme.md](https://github.com/wooorm/mdast-usage), or [lint the JavaScript in your markdown](https://github.com/wooorm/eslint-md).

## Table of Contents

*   [Installation](#installation)
*   [Usage](#usage)
*   [API](#api)
    *   [mdast.parse(value, options?)](#mdastparsevalue-options)
    *   [mdast.stringify(ast, options?)](#mdaststringifyast-options)
    *   [mdast.run(ast, options?)](#mdastrunast-options)
    *   [mdast.use(plugin, options?)](#mdastuseplugin-options)
*   [CLI](#cli)
*   [Benchmark](#benchmark)
*   [License](#license)

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
$ npm install mdast
```

[Component.js](https://github.com/componentjs/component):

```bash
$ component install wooorm/mdast
```

[Bower](http://bower.io/#install-packages):

```bash
$ bower install mdast
```

[Duo](http://duojs.org/#getting-started):

```javascript
var mdast = require('wooorm/mdast');
```

UMD (globals/AMD/CommonJS) ([uncompressed](mdast.js) and [compressed](mdast.min.js)):

```html
<script src="path/to/mdast.js"></script>
<script>
    var ast = mdast.parse('*hello* __world__');
    mdast.stringify(ast); // _hello_ **world**
</script>
```

## Usage

See [Nodes](doc/Nodes.md) for information about returned objects.

```javascript
var mdast = require('mdast');
```

Parse markdown with `mdast.parse`:

```javascript
var ast = mdast.parse('Some *emphasis*, **strongness**, and `code`.');
```

Yields:

```json
{
  "type": "root",
  "children": [
    {
      "type": "paragraph",
      "children": [
        {
          "type": "text",
          "value": "Some ",
          "position": {
            "start": {
              "line": 1,
              "column": 1
            },
            "end": {
              "line": 1,
              "column": 6
            }
          }
        },
        {
          "type": "emphasis",
          "children": [
            {
              "type": "text",
              "value": "emphasis",
              "position": {
                "start": {
                  "line": 1,
                  "column": 7
                },
                "end": {
                  "line": 1,
                  "column": 15
                }
              }
            }
          ],
          "position": {
            "start": {
              "line": 1,
              "column": 6
            },
            "end": {
              "line": 1,
              "column": 16
            }
          }
        },
        {
          "type": "text",
          "value": ", ",
          "position": {
            "start": {
              "line": 1,
              "column": 16
            },
            "end": {
              "line": 1,
              "column": 18
            }
          }
        },
        {
          "type": "strong",
          "children": [
            {
              "type": "text",
              "value": "strongness",
              "position": {
                "start": {
                  "line": 1,
                  "column": 20
                },
                "end": {
                  "line": 1,
                  "column": 30
                }
              }
            }
          ],
          "position": {
            "start": {
              "line": 1,
              "column": 18
            },
            "end": {
              "line": 1,
              "column": 32
            }
          }
        },
        {
          "type": "text",
          "value": ", and ",
          "position": {
            "start": {
              "line": 1,
              "column": 32
            },
            "end": {
              "line": 1,
              "column": 38
            }
          }
        },
        {
          "type": "inlineCode",
          "value": "code",
          "position": {
            "start": {
              "line": 1,
              "column": 38
            },
            "end": {
              "line": 1,
              "column": 44
            }
          }
        },
        {
          "type": "text",
          "value": ".",
          "position": {
            "start": {
              "line": 1,
              "column": 44
            },
            "end": {
              "line": 1,
              "column": 45
            }
          }
        }
      ],
      "position": {
        "start": {
          "line": 1,
          "column": 1
        },
        "end": {
          "line": 1,
          "column": 45
        }
      }
    }
  ],
  "position": {
    "start": {
      "line": 1,
      "column": 1
    },
    "end": {
      "line": 1,
      "column": 45
    }
  }
}
```

And passing that document into `mdast.stringify`:

```javascript
var doc = mdast.stringify(ast);
```

Yields:

```markdown
Some _emphasis_, **strongness**, and `code`.
```

## API

### [mdast](#api).parse(value, [options](doc/Options.md#parse)?)

Parse a markdown document into an abstract syntax tree.

**Signatures**

*   `ast = mdast.parse(value)`;
*   `ast = mdast.parse(value, options)`.

**Parameters**

*   `value` (`string`) — Markdown document;
*   `options` (`Object`) — Settings:
    *   `gfm` (`boolean`, default: `true`) — See [Github Flavoured Markdown](doc/Options.md#github-flavoured-markdown);
    *   `yaml` (`boolean`, default: `true`) — See [YAML](doc/Options.md#yaml);
    *   `commonmark` (`boolean`, default: `false`) — See [CommonMark](doc/Options.md#commonmark);
    *   `footnotes` (`boolean`, default: `false`) — See [Footnotes](doc/Options.md#footnotes);
    *   `pedantic` (`boolean`, default: `false`) — See [Pedantic](doc/Options.md#pedantic);
    *   `breaks` (`boolean`, default: `false`) — See [Breaks](doc/Options.md#breaks).

All options (including the options object itself) can be `null` or `undefined` to default to their default values.

**Returns**

`Object`: see [Nodes](doc/Nodes.md) for the AST specification.

### [mdast](#api).stringify([ast](doc/Nodes.md#node), [options](doc/Options.md#stringify)?)

Stringify an abstract syntax tree into a markdown document.

**Signatures**

*   `value = mdast.stringify(ast)`;
*   `value = mdast.stringify(ast, options)`.

**Parameters**

*   `ast` (`Object`) — An AST as returned by [`mdast.parse()`](#mdastparsevalue-options);
*   `options` (`Object`) — Settings:
    *   `setext` (`boolean`, default: `false`). See [Setext Headings](doc/Options.md#setext-headings);
    *   `closeAtx` (`boolean`, default: `false`). See [Closed ATX Headings](doc/Options.md#closed-atx-headings);
    *   `looseTable` (`boolean`, default: `false`). See [Loose Tables](doc/Options.md#loose-tables);
    *   `spacedTable` (`boolean`, default: `true`). See [Spaced Tables](doc/Options.md#spaced-tables);
    *   `referenceLinks` (`boolean`, default: `false`). See [Reference Links](doc/Options.md#reference-links);
    *   `fence` (`"~"` or ``"`"``, default: ``"`"``). See [Fence](doc/Options.md#fence);
    *   `fences` (`boolean`, default: `false`). See [Fences](doc/Options.md#fences);
    *   `bullet` (`"-"`, `"*"`, or `"+"`, default: `"-"`). See [List Item Bullets](doc/Options.md#list-item-bullets);
    *   `rule` (`"-"`, `"*"`, or `"_"`, default: `"*"`). See [Horizontal Rules](doc/Options.md#horizontal-rules);
    *   `ruleRepetition` (`number`, default: 3). See [Horizontal Rules](doc/Options.md#horizontal-rules);
    *   `ruleSpaces` (`boolean`, default `true`). See [Horizontal Rules](doc/Options.md#horizontal-rules);
    *   `strong` (`"_"`, or `"*"`, default `"*"`). See [Emphasis Markers](doc/Options.md#emphasis-markers);
    *   `emphasis` (`"_"`, or `"*"`, default `"_"`). See [Emphasis Markers](doc/Options.md#emphasis-markers).

All options (including the options object itself) can be `null` or `undefined` to default to their default values.

**Returns**

`string`: a document formatted in markdown.

### [mdast](#api).run([ast](doc/Nodes.md#node), options?)

Modify an abstract syntax tree by applying `use`d [`plugin`](doc/Plugins.md)s to it.

**Signatures**

*   `ast = mdast.run(ast)`;
*   `ast = mdast.run(ast, options)`.

**Parameters**

*   `ast` (`Object`) — An AST as returned by [`mdast.parse()`](#mdastparsevalue-options);
*   `options` (`Object`) — Settings, passed to plugins.

**Returns**

`Object`: the given [AST](doc/Nodes.md).

### [mdast](#api).use([plugin](doc/Plugins.md#plugin), options?)

Change the way [`mdast`](#api) works by using a [`plugin`](doc/Plugins.md).

**Signatures**

*   `mdast = mdast.use(plugin, options?)`;
*   `mdast = mdast.use(plugins)`.

**Parameters**

*   `plugin` (`Function`) — A [**Plugin**](doc/Plugins.md);
*   `plugins` (`Array.<Function>`) — A list of [**Plugins**](doc/Plugins.md);
*   `options` (`Object?`) — Passed to the plugin. Specified by its documentation.

**Returns**

`Object`: an instance of MDAST: The returned object functions just like **mdast** (it also has `use`, `parse`, and `stringify` methods), but caches the `use`d plugins. This provides the ability to chain `use` calls to use multiple plugins, but ensures the functioning of the **mdast** module does not change for other dependants.

## CLI

Install:

```bash
$ npm install --global mdast
```

Use:

```text
Usage: mdast [options] file|dir ...

Speedy Markdown parser/stringifier for multipurpose analysis

Options:

  -h, --help                output usage information
  -V, --version             output the version number
  -o, --output [path]       specify output location
  -c, --config-path <path>  specify configuration location
  -i, --ignore-path <path>  specify ignore location
  -s, --setting <settings>  specify settings
  -u, --use <plugins>       use transform plugin(s)
  -e, --ext <extensions>    specify extensions
  -a, --ast                 output AST information
  -q, --quiet               output less messages
  --no-rc                   disable configuration from .mdastrc
  --no-ignore               disable ignore from .mdastignore

Usage:

# Pass `Readme.md` through mdast
$ mdast Readme.md -o Readme-new.md

# Pass stdin through mdast, with settings, to stdout
$ cat Readme.md | mdast --setting "setext, bullet: *" > Readme-new.md

# Use a plugin
$ npm install mdast-toc
$ mdast --use mdast-toc Readme.md -o

# Rewrite markdown in a directory
$ mdast . -o

See also:

man 1 mdast, man 5 mdastrc, man 5 mdastignore, man 7 mdastconfig
```

## Benchmark

On a MacBook Air, it parses ± 322Kb of markdown (in 214 documents) per second.

```text
          214 fixtures (total: 80.62Kb)
   4 op/s » mdast.parse w/ `gfm: true`, and `yaml: true`
  69 op/s » mdast.stringify w/ `gfm: true`, and `yaml: true`
   4 op/s » mdast.parse w/ `gfm: false`, and `yaml: false`
  70 op/s » mdast.stringify w/ `gfm: false`, and `yaml: false`
   4 op/s » mdast.parse w/ `gfm: true`, `yaml: true`, and `commonmark: true`
  72 op/s » mdast.stringify w/ `gfm: true`, `yaml: true`, and `commonmark: true`
```

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)

> This project was initially a fork of [marked](https://github.com/chjj/marked).

Copyright (c) 2011-2014, Christopher Jeffrey. (MIT License)
