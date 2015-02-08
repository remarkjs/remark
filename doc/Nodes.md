![mdast](https://cdn.rawgit.com/wooorm/mdast/master/logo.svg)

# Nodes

This page contains the definition of the exposed objects and what they represent.

Information on **mdast** itself is available in the project’s [Readme.md](https://github.com/wooorm/mdast#readme).

## Node

[`mdast.parse()`](https://github.com/wooorm/mdast#mdastparsevalue-options) returns [**Node**](#node) objects—plain vanilla objects. Every **mdast** node implements the **Node** interface.

```idl
interface Node {
    type: string;
    position: Location;
}
```

## Location

Every [**Node**](#node) has a reference to its original location.

```idl
interface Location {
    start: Position;
    position: Position;
}
```

## Position

A position contains a column and a line. Both start at `1`.

```idl
interface Position {
    line: uint32 >= 1;
    column: uint32 >= 1;
}
```

## Parent

Most nodes implement the [**Parent**](#parent) ([**Node**](#node)) interface: block/inline nodes which accept other nodes as children.

```idl
interface Parent <: Node {
    children: [Node];
}
```

## Text

Most others implement [**Text**](#text) ([**Node**](#node)): nodes which accept a value.

```idl
interface Text <: Node {
    value: string;
}
```

## Root

[**Root**](#root) ([**Parent**](#parent)) houses all nodes. In addition, it holds a `footnote` property, housing [**FootnoteDefinition**](#footnotedefinition)s by their IDs (if [`footnotes: true`](https://github.com/wooorm/mdast/blob/master/doc/Options.md#footnotes), that is).

```idl
interface Root <: Parent {
    type: "root";
    footnotes: { FootnoteDefinition } | null;
}
```

## Paragraph

[**Paragraph**](#paragraph) ([**Parent**](#parent)) represents a unit of discourse dealing with a particular point or idea.

```idl
interface Paragraph <: Parent {
    type: "paragraph";
}
```

## Blockquote

[**Blockquote**](#blockquote) ([**Parent**](#parent)) represents a quote.

```idl
interface Blockquote <: Parent {
    type: "blockquote";
}
```

## Heading

[**Heading**](#heading) ([**Parent**](#parent)), just like with HMTL, with a level greater than or equal to 0, lower than or equal to 6.

```idl
interface Heading <: Parent {
    type: "heading";
    depth: 1 <= uint32 <= 6;
}
```

## Code

[**Code**](#code) ([**Text**](#text)) occurs at block level (see [**InlineCode**](#inlinecode) for code spans). **Code** sports a language tag (when using Github Flavoured Markdown fences with a flag, `null` otherwise).

```idl
interface Code <: Text {
    type: "code";
    lang: string | null;
}
```

## InlineCode

[**InlineCode**](#inlinecode) ([**Text**](#text)) occurs inline (see [**Code**](#code) for blocks). Inline code does not sport a `lang` attribute.

```idl
interface InlineCode <: Text {
    type: "inlineCode";
}
```

## YAML

[**YAML**](#yaml) ([**Text**](#text)) can occur at the start of a document, and contains embedded YAML data.

```idl
interface YAML <: Text {
    type: "yaml";
}
```

## HTML

[**HTML**](#html) ([**Text**](#text)) contains embedded HTML.

```idl
interface HTML <: Text {
    type: "html";
}
```

## List

[**List**](#list) ([**Parent**](#parent)) contains multiple [**ListItem**](#listitem)s.

```idl
interface List <: Parent {
    type: "list";
    ordered: true | false;
}
```

## ListItem

[**ListItem**](#listitem) ([**Parent**](#parent)) is contained by a [**List**](#list).

Loose **ListItem**s often contain block-level elements.

```idl
interface ListItem <: Parent {
    type: "listItem";
    loose: true | false;
}
```

## Table

[**Table**](#table) ([**Parent**](#parent)) represents tabular data, with alignment. Its children are either [**TableHeader**](#tableheader) (the first child), or [**TableRow**](#tablerow) (all other children).

The alignment of columns is represented in `table.align`.

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

## TableHeader

[**TableHeader**](#tableheader) ([**Parent**](#parent)). Its children are always [**TableCell**](#tablecell).

```idl
interface TableHeader <: Parent {
    type: "tableHeader";
}
```

## TableRow

[**TableRow**](#tablerow) ([**Parent**](#parent)). Its children are always [**TableCell**](#tablecell).

```idl
interface TableRow <: Parent {
    type: "tableRow";
}
```

## TableCell

[**TableCell**](#tablecell) ([**Parent**](#parent)).

```idl
interface TableCell <: Parent {
    type: "tableCell";
}
```

## HorizontalRule

Just a [**HorizontalRule**](#horizontalrule) ([**Node**](#node)).

```idl
interface HorizontalRule <: Node {
    type: "horizontalRule";
}
```

## Break

[**Break**](#break) ([**Node**](#node)) represents an explicit line break.

```idl
interface Break <: Node {
    type: "break";
}
```

## Emphasis

[**Emphasis**](#emphasis) ([**Parent**](#parent)) represents slightly important text.

```idl
interface Emphasis <: Parent {
    type: "emphasis";
}
```

## Strong

[**Strong**](#strong) ([**Parent**](#parent)) represents super important text.

```idl
interface Strong <: Parent {
    type: "strong";
}
```

## Delete

[**Delete**](#delete) ([**Parent**](#parent)) represents text ready for removal.

```idl
interface Delete <: Parent {
    type: "delete";
}
```

## Link

[**Link**](#link) ([**Parent**](#parent)) represents the humble hyperlink.

```idl
interface Link <: Parent {
    type: "link";
    title: string | null;
    href: string;
}
```

## Image

[**Image**](#image) ([**Node**](#node)) represents the figurative figure.

```idl
interface Image <: Node {
    type: "image";
    title: string | null;
    alt: string | null;
    src: string;
}
```

## Footnote

[**Footnote**](#footnote) ([**Node**](#node)) represents the inline location where a marker, to some other content related to the document but outside its flow (see [**FootnoteDefinition**](#footnotedefinition)), should appear.

```idl
interface Footnote <: Node {
    type: "footnote";
    id: string
}
```

## FootnoteDefinition

[**FootnoteDefinition**](#footnotedefinition) ([**Parent**](#parent)) represents the definition of a footnote, referenced somewhere in the document.

```idl
interface FootnoteDefinition <: Parent {
    type: "footnoteDefinition";
    id: string
}
```

## TextNode

[**TextNode**](#textnode) ([**Text**](#text)) represents everything that’s just text. Note that its `type` property is set to `text`, but is not to be confused with [**Text**](#text).

```idl
interface TextNode <: Text {
    type: "text";
}
```

## Escape

[**Escape**](#escape) ([**Text**](#text)) represents an escaped symbol. Useful when writing things that might otherwise be interpreted as markdown formatting.

```idl
interface Escape <: Text {
    type: "escape";
}
```
