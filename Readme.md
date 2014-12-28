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

See [Nodes](#nodes) for information about returned objects.

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
Some *emphasis*,  **strongness**, and `code`\.
```

Yeah, the escaped period is nasty, but it works! :smile:

### [mdast](#mdast).parse(value, options?)

Parameters:

- `value` (`string`) — Markdown document;
- `options` (`Object`, `null`, `undefined`) — Optional options:
    - `options.gfm` (`boolean`, default: `true`). See [Github Flavoured Markdown](#github-flavoured-markdown);
    - `options.tables` (`boolean`, default: `true`). See [Tables](#tables);
    - `options.pedantic` (`boolean`, default: `false`). See [Pedantic](#pedantic);
    - `options.breaks` (`boolean`, default: `false`). See [Breaks](#breaks);
    - `options.footnotes` (`boolean`, default: `false`). See [Footnotes](#footnotes).

Returns: An `Object`. See [Nodes](#nodes) for the AST specification.

### [mdast](#mdast).stringify(ast, options?)

Parameters:

- `ast` (`Object`) — An AST as returned by [mdast.parse](#mdastparsevalue-options);
- `options` (`Object`) — Optional options:
    - `options.preferSetextHeadings` (`boolean`, default: `false`). See [Setext Headings](#setext-headings);
    - `options.preferReferenceLinks` (`boolean`, default: `false`). See [Relative Links](#relative-links);
    - `options.bullet` (`"-"`, `"*"`, or `"+"`, default: `"-"`). See [List Item Bullets](#list-item-bullets);
    - `options.horizontalRule` (`"-"`, `"*"`, or `"_"`, default: `"*"`). See [Horizontal Rules](#horizontal-rules);
    - `options.horizontalRuleRepetition` (`number`, default: 3). See [Horizontal Rules](#horizontal-rules);
    - `options.horizontalRuleSpaces` (`boolean`, default `true`). See [Horizontal Rules](#horizontal-rules);
    - `options.strong` (`"_"`, or `"*"`, default `"*"`). See [Emphasis Markers](#emphasis-markers);
    - `options.emphasis` (`"_"`, or `"*"`, default `"_"`). See [Emphasis Markers](#emphasis-markers).

All options (including the options object itself) can be `null` or `undefined` to default to their default values.

Returns: A `string`.

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
    'preferSetextHeadings': true
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
    'horizontalRule': '*',
    'horizontalRuleRepetition': 80 / 2,
    'horizontalRuleSpaces': true
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

### Relative Links

Instead of exposing links inline, it’s possible to stringify reference-style links.

By default, links are stringigied inline.

```js
var ast = mdast.parse(
    'Lorem ipsum dolor sit [amet](http://amet.com "Amet").'
);

mdast.stringify(ast, {
    'preferReferenceLinks': true
});
```

Yields:

```md
Lorem ipsum dolor sit [amet][1].

[1]: http://amet.com "Amet"
```

## Nodes

### Node

`mdast.parse` returns node objects—plain vanilla objects. Every node implements the **[Node](#node)** interface:

```idl
interface Node {
    type: string;
}
```

### Parent

Most nodes implement the **[Parent](#parent)** interface (block/inline nodes which accept other nodes as children):

```idl
interface Parent <: Node {
    children: [Node];
}
```

### Text

All others, with the exception of **[Table](#table)**, **[HorizontalRule](#horizontalrule)**, **[Break](#break)**, and **[Footnote](#footnote)**, implement **[Text](#text)** (nodes which accept a value).

```idl
interface Text <: Node {
    value: string;
}
```

### Root

A **[Root](#root)** houses all other nodes. In addition, it holds a `footnote` property, housing the content of [Footnote](#footnote)s by their keys (if `footnotes: true`, that is).

```idl
interface Root <: Parent {
    type: "root";
    footnotes: { [nodes] } | null;
}
```

### Paragraph

```idl
interface Paragraph <: Parent {
    type: "paragraph";
}
```

### Blockquote

```idl
interface Blockquote <: Parent {
    type: "blockquote";
}
```

### Heading

A heading, just like with HMTL, greater-than-or-equal-to 0, lower-than-or-equal-to 6.

```idl
interface Heading <: Parent {
    type: "heading";
    depth: 1 <= uint32 <= 6;
}
```

### Code

Occurs at block level (see `inlineCode` for code spans). Code sports a language tag (when using Github Flavoured Markdown fences, `null` otherwise).

```idl
interface Code <: Text {
    type: "code";
    lang: string | null;
}
```

### InlineCode

Occurs inline (see `code` for blocks). Inline code does not sport a `lang` tag.

```idl
interface InlineCode <: Text {
    type: "inlineCode";
}
```

### HTML

A string of raw HTML.

```idl
interface HTML <: Text {
    type: "html";
}
```

### List

A list.

```idl
interface List <: Parent {
    type: "list";
    ordered: true | false;
}
```

### ListItem

An item in a list (only occurring in [**List**](#list)).

Loose list-items often contain block-level elements and should be wrapped in newlines.

```idl
interface ListItem <: Parent {
    type: "listItem";
    loose: true | false;
}
```

### Table

Tabular data, with alignment. Its children are either [**TableHeader**](#tableheader) (the first child), or [**TableRow**](#tablerow) (all other children).

- `table.align` is a list of align types.

```idl
interface Table <: Parent {
    type: "table";
    align: [alignType];
}
```

```idl
enum alignType {
    "left" | "right" | "center";
}
```

### TableHeader

A table header. Its children are always [**TableCell**](#tablecell).

```idl
interface TableHeader <: Parent {
    type: "tableHeader";
}
```

### TableRow

A table row. Its children are always [**TableCell**](#tablecell).

```idl
interface TableRow <: Parent {
    type: "tableRow";
}
```

### TableCell

Tabular data cell.

```idl
interface TableCell <: Parent {
    type: "tableCell";
}
```

### HorizontalRule

Just a horizontal rule.

```idl
interface HorizontalRule <: Node {
    type: "horizontalRule";
}
```

### Break

If you want, you can use `"breaks": true`, and instead of newlines, break nodes will show up.

```idl
interface Break <: Node {
    type: "break";
}
```

### Emphasis

Slightly important text.

```idl
interface Emphasis <: Parent {
    type: "emphasis";
}
```

### Strong

Super important text.

```idl
interface Strong <: Parent {
    type: "strong";
}
```

### Delete

Content ready for removal.

```idl
interface Delete <: Parent {
    type: "delete";
}
```

### Link

The humble hyperlink.

```idl
interface Link <: Parent {
    type: "link";
    title: string | null;
    href: string;
}
```

### Image

The figurative figure.

```idl
interface Image <: Node {
    type: "image";
    title: string | null;
    alt: string | null;
    src: string;
}
```

### Footnote

A footnote. These occur as inline nodes.

```idl
interface Footnote <: Node {
    type: "footnote";
    id : string
}
```

### Text

Everything that’s just text, is wrapped in a text node (d’oh):

```idl
interface TextNode <: Text {
    type: "text";
}
```

## Benchmark

On a MacBook Air, it parser about 3 megabytes of markdown per second, depending on how much markup v.s. plain text the document contains, and which language the document is in, that’s more than the [entire works of Shakespeare](http://vintagezen.com/zen/2013/4/1/plain-text), in two seconds.

```
           benchmarks * 56 fixtures (total: 47Kb markdown)
   64 op/s » mdast.parse
  179 op/s » mdast.stringify
```

## License

> This project was initially a fork of [marked](https://github.com/chjj/marked).

Copyright (c) 2011-2014, Christopher Jeffrey. (MIT License)
MIT © [Titus Wormer](http://wooorm.com)
