# ![mdast](https://cdn.rawgit.com/wooorm/mdast/master/logo.svg)

[![Build Status](https://img.shields.io/travis/wooorm/mdast.svg?style=flat)](https://travis-ci.org/wooorm/mdast) [![Coverage Status](https://img.shields.io/coveralls/wooorm/mdast.svg?style=flat)](https://coveralls.io/r/wooorm/mdast?branch=master)

**mdast** is speedy Markdown parser and stringifier for multipurpose analysis in JavaScript. Node and the browser. Lots of tests. 100% coverage.

It’s not [just](https://github.com/evilstreak/markdown-js) [another](https://github.com/chjj/marked) [Markdown](https://github.com/jonschlinkert/remarkable) [to](https://github.com/jgm/commonmark.js) [HTML](https://github.com/markdown-it/markdown-it) compiler. **mdast** can generate Markdown too, which enables plug-ins (and you) to [change your Readme.md](https://github.com/wooorm/mdast-usage), or [lint the JavaScript in your Markdown](https://github.com/wooorm/eslint-md).

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

UMD (globals/AMD/CommonJS) ([uncompressed](mdast.js) and [minified](mdast.min.js)):

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

Parameters:

- `value` (`string`) — Markdown document;
- `options` (`Object`, `null`, `undefined`) — Optional options:
  - `gfm` (`boolean`, default: `true`). See [Github Flavoured Markdown](doc/Options.md#github-flavoured-markdown);
  - `tables` (`boolean`, default: `true`). See [Tables](doc/Options.md#tables);
  - `yaml` (`boolean`, default: `true`). See [YAML](doc/Options.md#yaml);
  - `footnotes` (`boolean`, default: `false`). See [Footnotes](doc/Options.md#footnotes).
  - `pedantic` (`boolean`, default: `false`). See [Pedantic](doc/Options.md#pedantic);
  - `breaks` (`boolean`, default: `false`). See [Breaks](doc/Options.md#breaks);

All options (including the options object itself) can be `null` or `undefined` to default to their default values.

Returns: An `Object`. See [Nodes](doc/Nodes.md) for the AST specification.

### [mdast](#api).stringify([ast](doc/Nodes.md#node), [options](doc/Options.md#stringify)?)

Parameters:

- `ast` (`Object`) — An AST as returned by [`mdast.parse()`](#mdastparsevalue-options);
- `options` (`Object`) — Optional options:
  - `setext` (`boolean`, default: `false`). See [Setext Headings](doc/Options.md#setext-headings);
  - `closeAtx` (`boolean`, default: `false`). See [Closed ATX Headings](doc/Options.md#closed-atx-headings);
  - `looseTable` (`boolean`, default: `false`). See [Loose Tables](doc/Options.md#loose-tables);
  - `spacedTable` (`boolean`, default: `true`). See [Spaced Tables](doc/Options.md#spaced-tables);
  - `referenceLinks` (`boolean`, default: `false`). See [Reference Links](doc/Options.md#reference-links);
  - `fence: string` (`"~"` or ``"`"``, default: `~`). See [Fence](doc/Options.md#fence);
  - `fences` (`boolean`, default: `false`). See [Fences](doc/Options.md#fences);
  - `bullet` (`"-"`, `"*"`, or `"+"`, default: `"-"`). See [List Item Bullets](doc/Options.md#list-item-bullets);
  - `rule` (`"-"`, `"*"`, or `"_"`, default: `"*"`). See [Horizontal Rules](doc/Options.md#horizontal-rules);
  - `ruleRepetition` (`number`, default: 3). See [Horizontal Rules](doc/Options.md#horizontal-rules);
  - `ruleSpaces` (`boolean`, default `true`). See [Horizontal Rules](doc/Options.md#horizontal-rules);
  - `strong` (`"_"`, or `"*"`, default `"*"`). See [Emphasis Markers](doc/Options.md#emphasis-markers);
  - `emphasis` (`"_"`, or `"*"`, default `"_"`). See [Emphasis Markers](doc/Options.md#emphasis-markers).

All options (including the options object itself) can be `null` or `undefined` to default to their default values.

Returns: A `string`.

### [mdast](#api).use([plugin](#function-pluginast-options-mdast))

Creates a version of **mdast** which uses the given `plugin` to modify the AST after [`mdast.parse()`](#mdastparsevalue-options) is invoked.

The returned object functions just like **mdast** (it also has `use`, `parse`, and `stringify` methods), but caches the `use`d plugins.

This provides the ability to chain `use` calls to use multiple plugins, but ensures the functioning of **mdast** does not change for other dependants.

#### function plugin\([ast](doc/Nodes.md#node), options, [mdast](#api)\)

A plugin is a simple function which is invoked each time a document is [`mdast.parse()`](#mdastparsevalue-options)d. A plugin should change the [AST](doc/Nodes.md#node) to add or remove nodes, or change the **mdast** instance.

## CLI

Install:

```bash
$ npm install --global mdast
```

Use:

```text
Usage: mdast [options] file

Speedy Markdown parser/stringifier for multipurpose analysis

Options:

  -h, --help                output usage information
  -V, --version             output the version number
  -o, --output <path>       specify output location
  -s, --setting <settings>  specify settings
  -u, --use <plugins>       use transform plugin(s)
  -a, --ast                 output AST information
  --settings                output available settings

# Note that bash does not allow reading and writing
# to the same file through pipes

Usage:

# Pass `Readme.md` through mdast
$ mdast Readme.md -o Readme.md

# Pass stdin through mdast, with settings, to stdout
$ cat Readme.md | mdast --setting "setext, bullet: *" > Readme-new.md

# use a plugin
$ npm install mdast-toc
$ mdast --use mdast-toc -o Readme.md
```

## Benchmark

On a MacBook Air, it parser more than 3 megabytes of markdown per second, depending on how much markup v.s. plain text the document contains, and which language the document is in, that’s more than the [entire works of Shakespeare](http://www.gutenberg.org/ebooks/100), in under two seconds.

```text
         benchmarks * 76 fixtures (total: 50Kb markdown)
 63 op/s » mdast.parse
145 op/s » mdast.stringify
```

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)

> This project was initially a fork of [marked](https://github.com/chjj/marked).

Copyright (c) 2011-2014, Christopher Jeffrey. (MIT License)
