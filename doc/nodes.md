![mdast](https://cdn.rawgit.com/wooorm/mdast/master/logo.svg)

# Nodes

This page contains the definition of the exposed objects and what they represent.

Information on **mdast** itself is available in the project’s [readme.md](https://github.com/wooorm/mdast#readme).

## Table of Contents

*   [Node](#node)
*   [Location](#location)
*   [Position](#position)
*   [Parent](#parent)
*   [Text](#text)
*   [Root](#root)
*   [Paragraph](#paragraph)
*   [Blockquote](#blockquote)
*   [Heading](#heading)
*   [Code](#code)
*   [InlineCode](#inlinecode)
*   [YAML](#yaml)
*   [HTML](#html)
*   [List](#list)
*   [ListItem](#listitem)
*   [Table](#table)
*   [TableHeader](#tableheader)
*   [TableRow](#tablerow)
*   [TableCell](#tablecell)
*   [HorizontalRule](#horizontalrule)
*   [Break](#break)
*   [Emphasis](#emphasis)
*   [Strong](#strong)
*   [Delete](#delete)
*   [Link](#link)
*   [Image](#image)
*   [Footnote](#footnote)
*   [LinkReference](#linkreference)
*   [ImageReference](#imagereference)
*   [FootnoteReference](#footnotereference)
*   [Definition](#definition)
*   [FootnoteDefinition](#footnotedefinition)
*   [TextNode](#textnode)
*   [Escape](#escape)

## Node

[`mdast.parse()`](https://github.com/wooorm/mdast/blob/master/doc/mdast.3.md#mdastparsefile-options) returns [**Node**](#node) objects—plain vanilla objects. Every **mdast** node inherits the **Node** interface.

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
    end: Position;
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

Most nodes inherit the [**Parent**](#parent) ([**Node**](#node)) interface: block/inline nodes which accept other nodes as children.

```idl
interface Parent <: Node {
    children: [Node];
}
```

## Text

Most others inherit [**Text**](#text) ([**Node**](#node)): nodes which accept a value.

```idl
interface Text <: Node {
    value: string;
}
```

## Root

[**Root**](#root) ([**Parent**](#parent)) houses all nodes.

```idl
interface Root <: Parent {
    type: "root";
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

[**List**](#list) ([**Parent**](#parent)) contains [**ListItem**](#listitem)s.

The `start` property contains with the starting number of the list, when `ordered: true`, or `null` otherwise.

When all list items have `loose: false`, the list’s `loose` property is also `false`. Otherwise, `loose: true`.

```idl
interface List <: Parent {
    type: "list";
    loose: true | false;
    start: uint32 | null;
    ordered: true | false;
}
```

## ListItem

[**ListItem**](#listitem) ([**Parent**](#parent)) is a child of a [**List**](#list).

Loose **ListItem**s often contain more than one block-level elements.

When in `gfm: true` mode, a checked property exists on **ListItem**s, either set to `true` (when checked), `false` (when unchecked), or `null` (when not containing a checkbox). See [Task Lists](https://help.github.com/articles/writing-on-github/#task-lists) on GitHub for information.

```idl
interface ListItem <: Parent {
    type: "listItem";
    loose: true | false;
    checked: true | false | null | undefined;
}
```

## Table

[**Table**](#table) ([**Parent**](#parent)) represents tabular data, with alignment. Its children are either [**TableHeader**](#tableheader) (the first child), or [**TableRow**](#tablerow) (all other children).

`table.align` represents the alignment of columns.

```idl
interface Table <: Parent {
    type: "table";
    align: [alignType];
}
```

```idl
enum alignType {
    "left" | "right" | "center" | null;
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

[**Footnote**](#footnote) ([**Parent**](#parent)) represents an inline marker, whose content relates to the document but is outside its flow.

```idl
interface Footnote <: Parent {
    type: "footnote";
}
```

## LinkReference

[**Link**](#link) ([**Parent**](#parent)) represents a humble hyperlink, its `href` and `title` defined somewhere else in the document by a [**Definition**](#definition).

```idl
interface LinkReference <: Parent {
    type: "linkReference";
    identifier: string;
}
```

## ImageReference

[**Link**](#link) ([**Node**](#node)) represents a figurative figure, its `src` and `title`  defined somewhere else in the document by a [**Definition**](#definition).

```idl
interface ImageReference <: Node {
    type: "imageReference";
    alt: string | null;
    identifier: string;
}
```

## FootnoteReference

[**FootnoteReference**](#footnotereference) ([**Node**](#node)) is like  [**Footnote**](#footnote), but its content is already outside the documents flow: placed in a  [**FootnoteDefinition**](#footnotedefinition).

```idl
interface FootnoteReference <: Node {
    type: "footnoteReference";
    identifier: string;
}
```

## Definition

[**Definition**](#definition) ([**Node**](#node)) represents the definition (i.e., location and title) of a [**LinkReference**](#linkreference) or an [**ImageReference**](#imagereference).

```idl
interface Definition <: Node {
    type: "definition";
    identifier: string;
    title: string | null;
    link: string;
}
```

## FootnoteDefinition

[**FootnoteDefinition**](#footnotedefinition) ([**Parent**](#parent)) represents the definition (i.e., content) of a  [**FootnoteReference**](#footnotereference).

```idl
interface FootnoteDefinition <: Parent {
    type: "footnoteDefinition";
    identifier: string;
}
```

## TextNode

[**TextNode**](#textnode) ([**Text**](#text)) represents everything that’s just text. Note that its `type` property is `text`, but it’s different from [**Text**](#text).

```idl
interface TextNode <: Text {
    type: "text";
}
```

## Escape

[**Escape**](#escape) ([**Text**](#text)) represents an escaped symbol. Useful when writing things otherwise seen as markdown syntax.

```idl
interface Escape <: Text {
    type: "escape";
}
```
