# mdast

**mdast** is speedy Markdown parser (not compiler) for multipurpose analysis (a syntax tree) in JavaScript. NodeJS, and the browser. Lots of tests. 100% coverage.

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

See (Nodes)[#nodes] for information about he returned nodes.

### Markdown:
```js
var marked = require('marked');

marked('Some *emphasis*,  **strongness**, and `code`.');
```

Output:

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
                    "children": [
                        {
                            "type": "text",
                            "value": "emphasis"
                        }
                    ]
                },
                {
                    "type": "text",
                    "value": ",  "
                },
                {
                    "type": "strong",
                    "children": [
                        {
                            "type": "text",
                            "value": "strongness"
                        }
                    ]
                },
                {
                    "type": "text",
                    "value": ", and "
                },
                {
                    "type": "code",
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

### Github Flavoured Markdown

```js
marked('hello ~~hi~~ world', {
    'gfm' : true
});
```

Output:

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
                    "children": [
                        {
                            "type": "text",
                            "value": "hi"
                        }
                    ]
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

## Nodes

### Node
mdast returns node objects---just plain vanilla JS objects. Every node implements the following "Node" interface.

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
Occurring both inline and at block level. Code can sport a language tag (when using Github Flavoured Markdown fences).

```idl
interface Code <: Text {
    type: "code";
    lang: string | null;
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
An table is a bit different from all other nodes.

- `table.align` is a list of align types.
- `table.header` is a list of node lists.
- `table.rows` is a matrix of node lists.

```idl
interface Table <: Node {
    type: "table";
    align: [alignType];
    header: [[node]];
    rows: [[[node]]];
}
```

```idl
enum alignType {
    "left" | "right" | "center" | null;
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
Github Flavoured Markdown is a lot smarter about what's a paragraph, and what isn't. Thus, it supports line breaks.

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

### Footnote
A footnote. These occur as inline nodes, but also inside the "footnote" object on [root](#root).

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

## License

This project was initially a fork of [marked](https://github.com/chjj/marked).

Copyright (c) 2011-2014, Christopher Jeffrey. (MIT License)
Copyright (c) 2014, Titus Wormer. (MIT License)
