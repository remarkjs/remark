# ![mdast](https://cdn.rawgit.com/wooorm/mdast/master/logo.svg)

[![Build Status](https://img.shields.io/travis/wooorm/mdast.svg?style=flat)](https://travis-ci.org/wooorm/mdast) [![Coverage Status](https://img.shields.io/coveralls/wooorm/mdast.svg?style=flat)](https://coveralls.io/r/wooorm/mdast?branch=master)

**mdast** is speedy Markdown parser (and stringifier) for multipurpose analysis (a syntax tree) in JavaScript. Node.JS and the browser. Lots of tests. 100% coverage.

## Installation

npm:
```bash
$ npm install mdast
```

Component.js:
```bash
$ component install wooorm/mdast
```

Bower:
```bash
$ bower install mdast
```

## Usage

See [Nodes](doc/Nodes.md) for information about returned objects.

### mdast

```js
var mdast = require('mdast');

var ast = mdast.parse('Some *emphasis*,  **strongness**, and `code`.');
```

Yields:

```json
{
  "type" : "root",
  "children" : [
    {
      "type": "paragraph",
      "children": [
        {
          "type": "text",
          "value": "Some "
        },
        {
          "type": "emphasis",
          "children": [{
            "type": "text",
            "value": "emphasis"
          }]
        },
        {
          "type": "text",
          "value": ",  "
        },
        {
          "type": "strong",
          "children": [{
            "type": "text",
            "value": "strongness"
          }]
        },
        {
          "type": "text",
          "value": ", and "
        },
        {
          "type": "inlineCode",
          "value": "code"
        },
        {
          "type": "text",
          "value": "."
        }
      ]
    }
  ]
}
```

And passing that document into `mdast.stringify`:

```js
mdast.stringify(ast);
```

Yields:

```md
Some _emphasis_,  **strongness**, and `code`.
```

### [mdast](#mdast).parse(value, options?)

Parameters:

- `value` (`string`) — Markdown document;
- `options` (`Object`, `null`, `undefined`) — Optional options:
    - `options.gfm` (`boolean`, default: `true`). See [Github Flavoured Markdown](#github-flavoured-markdown);
    - `options.tables` (`boolean`, default: `true`). See [Tables](#tables);
    - `options.pedantic` (`boolean`, default: `false`). See [Pedantic](#pedantic);
    - `options.breaks` (`boolean`, default: `false`). See [Breaks](#breaks);
    - `options.footnotes` (`boolean`, default: `false`). See [Footnotes](#footnotes).

Returns: An `Object`. See [Nodes](doc/Nodes.md) for the AST specification.

### [mdast](#mdast).stringify(ast, options?)

Parameters:

- `ast` (`Object`) — An AST as returned by [mdast.parse](#mdastparsevalue-options);
- `options` (`Object`) — Optional options:
    - `options.setext` (`boolean`, default: `false`). See [Setext Headings](#setext-headings);
    - `options.referenceLinks` (`boolean`, default: `false`). See [Reference Links](#reference-links);
    - `options.referenceFootnotes` (`boolean`, default: `true`). See [Inline Footnotes](#inline-footnotes);
    - `options.fences` (`boolean`, default: `false`). See [Fences](#fences);
    - `options.bullet` (`"-"`, `"*"`, or `"+"`, default: `"-"`). See [List Item Bullets](#list-item-bullets);
    - `options.rule` (`"-"`, `"*"`, or `"_"`, default: `"*"`). See [Horizontal Rules](#horizontal-rules);
    - `options.ruleRepetition` (`number`, default: 3). See [Horizontal Rules](#horizontal-rules);
    - `options.ruleSpaces` (`boolean`, default `true`). See [Horizontal Rules](#horizontal-rules);
    - `options.strong` (`"_"`, or `"*"`, default `"*"`). See [Emphasis Markers](#emphasis-markers);
    - `options.emphasis` (`"_"`, or `"*"`, default `"_"`). See [Emphasis Markers](#emphasis-markers).

All options (including the options object itself) can be `null` or `undefined` to default to their default values.

Returns: A `string`.

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

  -h, --help            output usage information
  -v, --version         output version number
  -a, --ast             output AST information
      --options         output available settings
  -o, --option <option> specify settings

Usage:

# Note that bash does not allow reading/writing to the same through pipes

# Pass `Readme.md` through mdast
$ mdast Readme.md > Readme-new.md

# Pass stdin through mdast, with options
$ cat Readme.md | mdast -o "setext, bullet: *" > Readme-new.md
```

## Options

### Github Flavoured Markdown

Defaults to `true`.

```js
mdast.parse('hello ~~hi~~ world', {
    'gfm': true
});
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
          "value": "hello "
        },
        {
          "type": "delete",
          "children": [{
            "type": "text",
            "value": "hi"
          }]
        },
        {
          "type": "text",
          "value": " world"
        }
      ]
    }
  ]
}
```

### Tables

Defaults to `true`.

```js
var source =
    'Header 1 | Header 2\n' +
    ':------- | -------:\n' +
    'Cell 1   | Cell 2\n' +
    'Cell 3   | Cell 4\n';

mdast.parse(source, {
    'tables': true
});
```

Yields:

```json
{
  "type": "root",
  "children": [
    {
      "type": "table",
      "align": [
        "left",
        "right"
      ],
      "children": [
        {
          "type": "tableHeader",
          "children": [
            {
              "type": "tableCell",
              "children": [{
                "type": "text",
                "value": "Header 1"
              }]
            },
            {
              "type": "tableCell",
              "children": [{
                "type": "text",
                "value": "Header 2"
              }]
            }
          ]
        },
        {
          "type": "tableRow",
          "children": [
            {
              "type": "tableCell",
              "children": [{
                "type": "text",
                "value": "Cell 1"
              }]
            },
            {
              "type": "tableCell",
              "children": [{
                "type": "text",
                "value": "Cell 2"
              }]
            }
          ]
        },
        {
          "type": "tableRow",
          "children": [
            {
              "type": "tableCell",
              "children": [{
                "type": "text",
                "value": "Cell 3"
              }]
            },
            {
              "type": "tableCell",
              "children": [{
                "type": "text",
                "value": "Cell 4"
              }]
            }
          ]
        }
      ]
    }
  ]
}
```

### Pedantic

“Pedantic”, used by Gruber’s Markdown, matches emphasis-marks inside words. It’s mostly not what you want.

Defaults to `false`.

```js
mdast.parse('some_file_name', {
    'pedantic': true
});
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
          "value": "some"
        },
        {
          "type": "emphasis",
          "children": [{
            "type": "text",
            "value": "file"
          }]
        },
        {
          "type": "text",
          "value": "name"
        }
      ]
    }
  ]
}
```

### Breaks

“Breaks” prettifies line breaks inside a paragraph.

Defaults to `false`.

```js
mdast.parse('A\nparagraph', {
    'gfm': true,
    'breaks': true
});
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
          "value": "A"
        },
        {
          "type": "break"
        },
        {
          "type": "text",
          "value": "paragraph"
        }
      ]
    }
  ]
}
```

Whereas with `breaks: false` (and `gfm: true`), `mdast.parse` would yield:

```json
{
  "type": "root",
  "children": [
    {
      "type": "paragraph",
      "children": [{
        "type": "text",
        "value": "A\nparagraph"
      }]
    }
  ]
}
```

### Footnotes

“Footnotes” enables use of inline- and reference-style footnotes.

It’s possible to reference other footnotes inside footnotes.

Defaults to `false`.

```js
var source =
    'Something something[^or something?]\n' +
    'And something else[^1]\n\n' +
    '[^1]: This content here can contains paragraphs,\n' +
    '   - and lists\n';

mdast.parse(source, {
    'footnotes': true
});
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
          "value": "Something something"
        },
        {
          "type": "footnote",
          "id": "footnote-1"
        },
        {
          "type": "text",
          "value": "\nAnd something else"
        },
        {
          "type": "footnote",
          "id": "1"
        }
      ]
    }
  ],
  "footnotes": {
    "1": [
      {
        "type": "paragraph",
        "children": [{
          "type": "text",
          "value": "This content here can contains paragraphs,"
        }]
      },
      {
        "type": "list",
        "ordered": false,
        "children": [
          {
            "type": "listItem",
            "children": [{
              "type": "text",
              "value": "and lists"
            }]
          }
        ]
      }
    ],
    "footnote-1": [
      {
        "type": "paragraph",
        "children": [{
          "type": "text",
          "value": "or something?"
        }]
      }
    ]
  }
}
```

### Setext Headings

When choosing to stringify to [Setext headings](http://en.wikipedia.org/wiki/Setext#Setext_tags), primary headings are underlined with equals-signs, and secondary headers with dashes.

Defaults to `false`.

```js
var ast = mdast.parse(
    '# First level\n' +
    '\n' +
    '## Second level\n' +
    '\n' +
    '### Third level\n'
);

mdast.stringify(ast, {
    'setextHeadings': true
});
```

Yields:

```md
First level
===========

Second level
------------

### Third level
```

### List Item Bullets

It’s possible to specify which bullet to use for unordered [lists](https://github.com/wooorm/mdast#list).

Defaults to `"-"`.

```js
var ast = mdast.parse(
    '- First level\n' +
    '\n' +
    '  - Second level\n' +
    '\n' +
    '    - Third level\n'
);

mdast.stringify(ast, {
    'bullet': '*'
});
```

Yields:

```md
* First level

  * Second level

    * Third level
```

### Horizontal Rules

It’s possible to specify how to render horizontal rules.

By default horizontal rules are rendered as three asterisks joined by spaces.

```js
var ast = mdast.parse(
    'A rule:\n' +
    '\n' +
    '---\n'
);

mdast.stringify(ast, {
    'rule': '*',
    'ruleRepetition': 80 / 2,
    'ruleSpaces': true
});
```

Yields:

```md
A rule:

* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
```

### Emphasis Markers

It’s possible to specify how to render emphasis and strong nodes.

By default, slight emphasis is wrapped in underscores, whereas strong emphasis is wrapped in (two) asterisks.

```js
var ast = mdast.parse(
    '*emphasis*\n' +
    '\n' +
    '__strong__\n' +
);

mdast.stringify(ast, {
    'emphasis': '_',
    'strong': '*'
});
```

Yields:

```md
_emphasis_

**strong**
```

### Reference Links

Instead of exposing links inline, it’s possible to stringify reference-style links.

By default, links are stringified inline.

```js
var ast = mdast.parse(
    'Lorem ipsum dolor sit [amet](http://amet.com "Amet").'
);

mdast.stringify(ast, {
    'referenceLinks': true
});
```

Yields:

```md
Lorem ipsum dolor sit [amet][1].

[1]: http://amet.com "Amet"
```

### Inline Footnotes

Instead of exposing reference-style footnotes, it’s possible to stringify inline footnotes (when possible).

By default, footnotes are stringified after the document. By setting `referenceFootnotes: false` footnotes containing a single paragraph can be stringified inline.

```js
var ast = mdast.parse(
    'Some text[^1].\n' +
    '\n' +
    '[^1]: And a footnote\n', {
    'footnotes': true
});

mdast.stringify(ast, {
    'referenceFootnotes': false
});
```

Yields:

```md
Some text[^And a footnote].
```

### Fences

By default, code blocks without a programming-language flag are stringified using indentation, instead of [GFMs fences](https://help.github.com/articles/github-flavored-markdown/#fenced-code-blocks).

```js
var ast = mdast.parse(
    'A code block:\n' +
    '\n' +
    '    alert(\'Hello World!\');\n'
);

mdast.stringify(ast, {
    'fences': true
});
```

Yields:

````md
A code block:

\```
alert('Hello World!');
\```
````

The above example contains two slahes to make sure GitHub renders the markdown (in markdown) properly.

## Benchmark

On a MacBook Air, it parser more than 3 megabytes of markdown per second, depending on how much markup v.s. plain text the document contains, and which language the document is in, that’s more than the [entire works of Shakespeare](http://www.gutenberg.org/ebooks/100), in under two seconds.

```text
           benchmarks * 76 fixtures (total: 50Kb markdown)
   63 op/s » mdast.parse
  145 op/s » mdast.stringify
```

## License

> This project was initially a fork of [marked](https://github.com/chjj/marked).

Copyright (c) 2011-2014, Christopher Jeffrey. (MIT License)

MIT © [Titus Wormer](http://wooorm.com)
