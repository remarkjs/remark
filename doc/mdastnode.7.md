# mdastnode(7) -- mdast syntax representation

## SYNOPSIS

```json
{
  "type": "strong",
  "children": [{
    "type": "text",
    "value": "Foo",
    "position": {
      "start": {
          "line": 1,
          "column": 3,
          "offset": 2
      },
      "end": {
          "line": 1,
          "column": 6,
          "offset": 5
      }
    }
  }],
  "position": {
    "start": {
        "line": 1,
        "column": 1,
        "offset": 0
    },
    "end": {
        "line": 1,
        "column": 8,
        "offset": 7
    }
  }
}
```

## DESCRIPTION

**mdast** exposes markdown as an abstract syntax tree. _Abstract_
means not all information is stored in this tree and an exact replica
of the original document cannot be re-created. _Syntax Tree_ means syntax
**is** present in the tree, thus an exact syntactic document can be
re-created.

This manual contains the definition of the exposed nodes and what they
represent.

## NODE

**mdast**(3)’s `parse` method returns **Node** objects—plain vanilla
objects.  Every **mdast** node inherits the **Node** interface.

```idl
interface Node {
    type: string;
    position: Location?;
}
```

## LOCATION

**Node** can have a reference to its original location, if applicable.
Start determines the line and column at which the original location starts;
end, respectively; and indent the column at which further lines start.

```idl
interface Location {
    start: Position;
    end: Position;
    indent: [uint32 >= 1]
}
```

## POSITION

A position contains a column and a line.  Both start at `1`.

```idl
interface Position {
    line: uint32 >= 1;
    column: uint32 >= 1;
}
```

## PARENT

Most nodes inherit the **Parent** (**Node**) interface: nodes which accept
other nodes as children.

```idl
interface Parent <: Node {
    children: [Node];
}
```

## TEXT

Most others inherit **Text** (**Node**): nodes which accept a value.

```idl
interface Text <: Node {
    value: string;
}
```

## ROOT

**Root** (**Parent**) houses all nodes.

```idl
interface Root <: Parent {
    type: "root";
}
```

## PARAGRAPH

**Paragraph** (**Parent**) represents a unit of discourse dealing with a
particular point or idea.

```idl
interface Paragraph <: Parent {
    type: "paragraph";
}
```

## BLOCKQUOTE

**Blockquote** (**Parent**) represents a quote.

```idl
interface Blockquote <: Parent {
    type: "blockquote";
}
```

## HEADING

**Heading** (**Parent**), just like with HTML, with a level greater than or
equal to 1, lower than or equal to 6.

```idl
interface Heading <: Parent {
    type: "heading";
    depth: 1 <= uint32 <= 6;
}
```

## CODE

**Code** (**Text**) occurs at block level (see **InlineCode** for code spans).
**Code** sports a language tag (when using Github Flavoured Markdown fences
with a flag, `null` otherwise).

```idl
interface Code <: Text {
    type: "code";
    lang: string | null;
}
```

## INLINECODE

**InlineCode** (**Text**) occurs inline (see **Code** for blocks).  Inline code
does not sport a `lang` attribute.

```idl
interface InlineCode <: Text {
    type: "inlineCode";
}
```

## YAML

**YAML** (**Text**) can occur at the start of a document, and contains embedded
YAML data.

```idl
interface YAML <: Text {
    type: "yaml";
}
```

## HTML

**HTML** (**Text**) contains embedded HTML.

```idl
interface HTML <: Text {
    type: "html";
}
```

## LIST

**List** (**Parent**) contains **ListItem**’s.

The `start` property contains the starting number of the list when
`ordered: true`; `null` otherwise.

When all list items have `loose: false`, the list’s `loose` property is also
`false`.  Otherwise, `loose: true`.

```idl
interface List <: Parent {
    type: "list";
    loose: true | false;
    start: uint32 | null;
    ordered: true | false;
}
```

## LISTITEM

**ListItem** (**Parent**) is a child of a **List**.

Loose **ListItem**’s often contain more than one block-level elements.

When in `gfm: true` mode, a checked property exists on **ListItem**’s,
either set to `true` (when checked), `false` (when unchecked), or `null`
(when not containing a checkbox).  See
[Task Lists on GitHub](https://help.github.com/articles/writing-on-github/#task-lists)
for information.

```idl
interface ListItem <: Parent {
    type: "listItem";
    loose: true | false;
    checked: true | false | null | undefined;
}
```

## TABLE

**Table** (**Parent**) represents tabular data, with alignment.  Its children
are either **TableHeader** (the first child), or **TableRow** (all other
children).

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

## TABLEHEADER

**TableHeader** (**Parent**).  Its children are always **TableCell**.

```idl
interface TableHeader <: Parent {
    type: "tableHeader";
}
```

## TABLEROW

**TableRow** (**Parent**).  Its children are always **TableCell**.

```idl
interface TableRow <: Parent {
    type: "tableRow";
}
```

## TABLECELL

**TableCell** (**Parent**). Contains a single tabular field.

```idl
interface TableCell <: Parent {
    type: "tableCell";
}
```

## HORIZONTALRULE

Just a **HorizontalRule** (**Node**).

```idl
interface HorizontalRule <: Node {
    type: "horizontalRule";
}
```

## BREAK

**Break** (**Node**) represents an explicit line break.

```idl
interface Break <: Node {
    type: "break";
}
```

## EMPHASIS

**Emphasis** (**Parent**) represents slightly important text.

```idl
interface Emphasis <: Parent {
    type: "emphasis";
}
```

## STRONG

**Strong** (**Parent**) represents super important text.

```idl
interface Strong <: Parent {
    type: "strong";
}
```

## DELETE

**Delete** (**Parent**) represents text ready for removal.

```idl
interface Delete <: Parent {
    type: "delete";
}
```

## LINK

**Link** (**Parent**) represents the humble hyperlink.

```idl
interface Link <: Parent {
    type: "link";
    title: string | null;
    href: string;
}
```

## IMAGE

**Image** (**Node**) represents the figurative figure.

```idl
interface Image <: Node {
    type: "image";
    title: string | null;
    alt: string | null;
    src: string;
}
```

## FOOTNOTE

**Footnote** (**Parent**) represents an inline marker, whose content relates to
the document but is outside its flow.

```idl
interface Footnote <: Parent {
    type: "footnote";
}
```

## LINKREFERENCE

**Link** (**Parent**) represents a humble hyperlink, its `href` and `title`
defined somewhere else in the document by a **Definition**.

```idl
interface LinkReference <: Parent {
    type: "linkReference";
    identifier: string;
}
```

## IMAGEREFERENCE

**Link** (**Node**) represents a figurative figure, its `src` and `title`
defined somewhere else in the document by a **Definition**.

```idl
interface ImageReference <: Node {
    type: "imageReference";
    alt: string | null;
    identifier: string;
}
```

## FOOTNOTEREFERENCE

**FootnoteReference** (**Node**) is like **Footnote**, but its content is
already outside the documents flow: placed in a **FootnoteDefinition**.

```idl
interface FootnoteReference <: Node {
    type: "footnoteReference";
    identifier: string;
}
```

## DEFINITION

**Definition** (**Node**) represents the definition (i.e., location and title)
of a **LinkReference** or an **ImageReference**.

```idl
interface Definition <: Node {
    type: "definition";
    identifier: string;
    title: string | null;
    link: string;
}
```

## FOOTNOTEDEFINITION

**FootnoteDefinition** (**Parent**) represents the definition (i.e., content)
of a **FootnoteReference**.

```idl
interface FootnoteDefinition <: Parent {
    type: "footnoteDefinition";
    identifier: string;
}
```

## TEXTNODE

**TextNode** (**Text**) represents everything that’s just text.  Note that its
`type` property is `text`, but it’s different from **Text**.

```idl
interface TextNode <: Text {
    type: "text";
}
```

## ESCAPE

**Escape** (**Text**) represents an escaped symbol.  Useful when writing
things otherwise seen as markdown syntax.

```idl
interface Escape <: Text {
    type: "escape";
}
```

## BUGS

<https://github.com/wooorm/mdast/issues>

## SEE ALSO

**mdast**(1), **mdast**(3).

## AUTHOR

Written by Titus Wormer <mailto:tituswormer@gmail.com>
