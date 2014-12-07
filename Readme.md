# mdast

**mdast** is speedy Markdown parser for multipurpose analysis (a syntax tree) in JavaScript. NodeJS, and the browser. Lots of tests. 100% coverage.

It's close, but not yet there, to being able to compile the AST back to markdown again: it still has some slight issues with loose lists.

## Installation

npm:
```sh
$ npm install mdast
```

Component.js:
```sh
$ component install wooorm/mdast
```

Bower:
```sh
$ bower install mdast
```

## Usage

See [Nodes](#nodes) for information about he returned nodes.

### Markdown:

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

And passing that document into `mdast.stringify`

```js
mdast.stringify(ast);
```

Yields:

```md
Some *emphasis*,  **strongness**, and `code`\.
```

Yeah, the escaped period is nasty, but it works :)

### Github Flavoured Markdown
defaults to true.

```js
mdast.parse('hello ~~hi~~ world', {
    'gfm' : true
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
defaults to true.

```js
var source =
    'Header 1 | Header 2\n' +
    ':------- | -------:\n' +
    'Cell 1   | Cell 2\n' +
    'Cell 3   | Cell 4\n';

mdast.parse(source, {
    'tables' : true
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
“Pedantic”, used by Gruber's Markdown, matches emphasis-marks inside words. It's mostly not what you want.

Defaults to false.

```js
mdast.parse('some_file_name', {
    'pedantic' : true
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

Defaults to false.

```js
mdast.parse('A\nparagraph', {
    'gfm' : true,
    'breaks' : true
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

Whereas with breaks false (and GFM true), mdast.parse would yield:

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
Its also possible to reference other footnotes inside footnotes.

Defaults to false.

```js
var source =
    'Something something[^or something?]\n' +
    'And something else[^1]\n\n' +
    '[^1]: This content here can contains paragraphs,\n' +
    '   - and lists\n';

mdast.parse(source, {
    'footnotes' : true
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

## Nodes

### Node
mdast.parse returns node objects---just plain vanilla JS objects. Every node implements the following "Node" interface.

```idl
interface Node {
    type: string;
}
```

### Parent
Most nodes implement the "Parent" interface (block/inline nodes which accept other nodes as children)...

```idl
interface Parent <: Node {
    children: [Node];
}
```

### Text
...all others, with the exception of [Table](#table), [HorizontalRule](#horizontalrule), [Break](#break), and [Footnote](#footnote), implement "Text" (nodes which accept a value.)

```idl
interface Parent <: Text {
    value: string;
}
```

### Root
A root element houses all other nodes. In addition, it hold a footnote property, housing the content of [Footnote](#footnote)s by their keys (if "footnotes" is true in options, that is).

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
Occurs at block level (see `inlineCode` for code spans). Code sports a language tag (when using Github Flavoured Markdown fences, null otherwise).

```idl
interface Code <: Text {
    type: "code";
    lang: string | null;
}
```

### InlineCode
Occurs at inline level (see `code` for code blocks). Inline code does not sport a `lang` tag.

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
An item in a list (always occurs inside a list).

```idl
interface ListItem <: Parent {
    type: "listItem";
}
```

### Table
Tabular data, with alignment. Its children are either tableHeader (the first child), or tableRow (all other children).

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
A table header. Its children are always `tableCell`.

```idl
interface TableHeader <: Parent {
    type: "tableHeader";
}
```

### TableRow
A table row. Its children are always `tableCell`.

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
interface Image <: Parent {
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
Everything thats just text, is wrapped in a text node (d'oh):

```idl
interface Text <: Text {
    type: "text";
}
```

## Benchmark

Run the benchmark yourself:

```sh
$ npm run benchmark
```

On a MacBook Air, it parser about 5 megabytes of markdown per second, depending on how much markup v.s. plain text the document contains, and which language the document is in, that's the [entire works of Shakespeare](http://vintagezen.com/zen/2013/4/1/plain-text), in a second.

```
             benchmarks * 56 fixtures (total: 47Kb markdown)
    110 op/s » mdast.parse -- this module
```

## License

This project was initially a fork of [marked](https://github.com/chjj/marked).

Copyright (c) 2011-2014, Christopher Jeffrey. (MIT License)

MIT © 2014 Titus Wormer
