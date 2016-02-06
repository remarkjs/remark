# remarksetting(7) -- remark settings

## SYNOPSIS

**remark**(1), **remark**(3), **remarkrc**(5)

## DESCRIPTION

This page contains information and usage examples regarding
available options for **remark**(3)’s `parse()` and `stringify()`.

## Table of Contents

*   [Parse](#parse)

    *   [Breaks](#breaks)
    *   [CommonMark](#commonmark)
    *   [Footnotes](#footnotes)
    *   [GitHub Flavoured Markdown](#github-flavoured-markdown)
    *   [Pedantic](#pedantic)
    *   [Position](#position)
    *   [YAML](#yaml)

*   [Stringify](#stringify)

    *   [List Item Bullets](#list-item-bullets)
    *   [Closed ATX Headings](#closed-atx-headings)
    *   [Emphasis Markers](#emphasis-markers)
    *   [Encoding Entities](#encoding-entities)
    *   [Fence](#fence)
    *   [Fences](#fences)
    *   [List Item Indent](#list-item-indent)
    *   [Loose Tables](#loose-tables)
    *   [List Marker Increase](#list-marker-increase)
    *   [Horizontal Rules](#horizontal-rules)
    *   [Setext Headings](#setext-headings)
    *   [Spaced Tables](#spaced-tables)

## Parse

### Breaks

Setting `breaks: true` (default: `false`) exposes new line characters inside
Paragraphs as Breaks.

The following document:

```markdown
A
paragraph.
```

And the below JavaScript:

```javascript
var ast = remark.parse(document, {
  "breaks": true
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
          "value": "A",
          "position": {
            "start": {
              "line": 1,
              "column": 1
            },
            "end": {
              "line": 1,
              "column": 2
            },
            "indent": []
          }
        },
        {
          "type": "break",
          "position": {
            "start": {
              "line": 1,
              "column": 2
            },
            "end": {
              "line": 2,
              "column": 1
            },
            "indent": [
              1
            ]
          }
        },
        {
          "type": "text",
          "value": "paragraph.",
          "position": {
            "start": {
              "line": 2,
              "column": 1
            },
            "end": {
              "line": 2,
              "column": 11
            },
            "indent": []
          }
        }
      ],
      "position": {
        "start": {
          "line": 1,
          "column": 1
        },
        "end": {
          "line": 2,
          "column": 11
        },
        "indent": [
          1
        ]
      }
    }
  ],
  "position": {
    "start": {
      "line": 1,
      "column": 1
    },
    "end": {
      "line": 3,
      "column": 1
    }
  }
}
```

### CommonMark

Setting `commonmark: true` (default: `false`) allows and disallows
several constructs.

The following constructs are allowed:

*   Empty lines to split **Blockquotes**;

*   Parentheses (`(` and `)`) as delimiters for **Link** and **Image** titles;

*   Any escaped [ASCII-punctuation](http://spec.commonmark.org/0.18/#backslash-escapes)
    character;

*   Ordered list-items with a closing parenthesis (`)`);

*   Link (and footnote, when enabled) reference definitions in blockquotes;

The following constructs are not allowed:

*   **Code** directly following a **Paragraph**;

*   ATX-headings (`# Hash headings`) without spacing after initial hashes
    or and before closing hashes;

*   Setext headings (`Underline headings\n---`) when following a paragraph;

*   Newlines in **Link** and **Image** titles;

*   White space in **Link** and **Image** URLs in auto-links (links in
    brackets, `<` and `>`);

*   Lazy **Blockquote** continuation—lines not preceded by a closing angle
    bracket (`>`)—for **List**s, **Code**, and **ThematicBreak**.

The following document:

```markdown
This is a paragraph
    and this is also part of the preceding paragraph.
```

And the below JavaScript:

```javascript
var ast = remark.parse(document, {
  "commonmark": true
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
          "value": "This is a paragraph\n    and this is also part of the preceding paragraph.",
          "position": {
            "start": {
              "line": 1,
              "column": 1
            },
            "end": {
              "line": 2,
              "column": 54
            },
            "indent": [
              1
            ]
          }
        }
      ],
      "position": {
        "start": {
          "line": 1,
          "column": 1
        },
        "end": {
          "line": 2,
          "column": 54
        },
        "indent": [
          1
        ]
      }
    }
  ],
  "position": {
    "start": {
      "line": 1,
      "column": 1
    },
    "end": {
      "line": 3,
      "column": 1
    }
  }
}
```

### Footnotes

Setting `footnotes: true` (default: `false`) enables inline and
reference footnotes.

Footnotes are wrapped in square brackets, and preceded by a caret (`^`).

It is possible to reference other footnotes inside footnotes.

The following document:

```markdown
Something something[^or something?].

And something else[^1].

[^1]: This reference style footnote can contains paragraphs.

   - and lists
```

And the below JavaScript:

```javascript
var ast = remark.parse(document, {
  "footnotes": true
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
          "value": "Something something",
          "position": {
            "start": {
              "line": 1,
              "column": 1
            },
            "end": {
              "line": 1,
              "column": 20
            },
            "indent": []
          }
        },
        {
          "type": "footnote",
          "children": [
            {
              "type": "text",
              "value": "or something?",
              "position": {
                "start": {
                  "line": 1,
                  "column": 36
                },
                "end": {
                  "line": 1,
                  "column": 49
                },
                "indent": []
              }
            }
          ],
          "position": {
            "start": {
              "line": 1,
              "column": 20
            },
            "end": {
              "line": 1,
              "column": 36
            },
            "indent": []
          }
        },
        {
          "type": "text",
          "value": ".",
          "position": {
            "start": {
              "line": 1,
              "column": 36
            },
            "end": {
              "line": 1,
              "column": 37
            },
            "indent": []
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
          "column": 37
        },
        "indent": []
      }
    },
    {
      "type": "paragraph",
      "children": [
        {
          "type": "text",
          "value": "And something else",
          "position": {
            "start": {
              "line": 3,
              "column": 1
            },
            "end": {
              "line": 3,
              "column": 19
            },
            "indent": []
          }
        },
        {
          "type": "footnoteReference",
          "identifier": "1",
          "position": {
            "start": {
              "line": 3,
              "column": 19
            },
            "end": {
              "line": 3,
              "column": 23
            },
            "indent": []
          }
        },
        {
          "type": "text",
          "value": ".",
          "position": {
            "start": {
              "line": 3,
              "column": 23
            },
            "end": {
              "line": 3,
              "column": 24
            },
            "indent": []
          }
        }
      ],
      "position": {
        "start": {
          "line": 3,
          "column": 1
        },
        "end": {
          "line": 3,
          "column": 24
        },
        "indent": []
      }
    },
    {
      "type": "footnoteDefinition",
      "identifier": "1",
      "children": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "value": "This reference style footnote can contains paragraphs.",
              "position": {
                "start": {
                  "line": 5,
                  "column": 7
                },
                "end": {
                  "line": 5,
                  "column": 61
                },
                "indent": []
              }
            }
          ],
          "position": {
            "start": {
              "line": 5,
              "column": 7
            },
            "end": {
              "line": 5,
              "column": 61
            },
            "indent": []
          }
        },
        {
          "type": "list",
          "ordered": false,
          "start": null,
          "loose": false,
          "children": [
            {
              "type": "listItem",
              "loose": false,
              "checked": null,
              "children": [
                {
                  "type": "paragraph",
                  "children": [
                    {
                      "type": "text",
                      "value": "and lists",
                      "position": {
                        "start": {
                          "line": 7,
                          "column": 6
                        },
                        "end": {
                          "line": 7,
                          "column": 15
                        },
                        "indent": []
                      }
                    }
                  ],
                  "position": {
                    "start": {
                      "line": 7,
                      "column": 6
                    },
                    "end": {
                      "line": 7,
                      "column": 15
                    },
                    "indent": []
                  }
                }
              ],
              "position": {
                "start": {
                  "line": 7,
                  "column": 1
                },
                "end": {
                  "line": 7,
                  "column": 15
                },
                "indent": []
              }
            }
          ],
          "position": {
            "start": {
              "line": 7,
              "column": 1
            },
            "end": {
              "line": 7,
              "column": 15
            },
            "indent": []
          }
        }
      ],
      "position": {
        "start": {
          "line": 5,
          "column": 1
        },
        "end": {
          "line": 7,
          "column": 15
        },
        "indent": [
          1,
          1
        ]
      }
    }
  ],
  "position": {
    "start": {
      "line": 1,
      "column": 1
    },
    "end": {
      "line": 8,
      "column": 1
    }
  }
}
```

### GitHub Flavoured Markdown

Setting `gfm: true` (default: `true`) enables:

*   [Fenced code blocks](https://help.github.com/articles/github-flavored-markdown/#fenced-code-blocks);
*   [Autolinking of URLs](https://help.github.com/articles/github-flavored-markdown/#url-autolinking);
*   [Deletions (strikethrough)](https://help.github.com/articles/github-flavored-markdown/#strikethrough);
*   [Task lists](https://help.github.com/articles/writing-on-github/#task-lists);
*   [Tables](https://help.github.com/articles/github-flavored-markdown/#tables).

The following document:

```markdown
hello ~~hi~~ world
```

And the below JavaScript:

```javascript
var ast = remark.parse(document, {
  "gfm": true
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
          "value": "hello ",
          "position": {
            "start": {
              "line": 1,
              "column": 1
            },
            "end": {
              "line": 1,
              "column": 7
            },
            "indent": []
          }
        },
        {
          "type": "delete",
          "children": [
            {
              "type": "text",
              "value": "hi",
              "position": {
                "start": {
                  "line": 1,
                  "column": 9
                },
                "end": {
                  "line": 1,
                  "column": 11
                },
                "indent": []
              }
            }
          ],
          "position": {
            "start": {
              "line": 1,
              "column": 7
            },
            "end": {
              "line": 1,
              "column": 13
            },
            "indent": []
          }
        },
        {
          "type": "text",
          "value": " world",
          "position": {
            "start": {
              "line": 1,
              "column": 13
            },
            "end": {
              "line": 1,
              "column": 19
            },
            "indent": []
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
          "column": 19
        },
        "indent": []
      }
    }
  ],
  "position": {
    "start": {
      "line": 1,
      "column": 1
    },
    "end": {
      "line": 2,
      "column": 1
    }
  }
}
```

### Pedantic

Setting `pedantic: true` (default: `false`):

*   Adds support for emphasis and strongness, with underscores (`_`), inside
    words;

*   Adds support for different list bullets (`*`, `-`, `+`) for the same list
    (when in `commonmark: true` mode, the same goes for both ordered list
    delimiters: `.` and `)`);

*   Removes less spaces in list-items (a maximum of four instead of the whole
    indent).

The following document:

```markdown
Check out some_file_name.txt
```

And the below JavaScript:

```javascript
var ast = remark.parse(document, {
  "pedantic": true
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
          "value": "Check out some",
          "position": {
            "start": {
              "line": 1,
              "column": 1
            },
            "end": {
              "line": 1,
              "column": 15
            },
            "indent": []
          }
        },
        {
          "type": "emphasis",
          "children": [
            {
              "type": "text",
              "value": "file",
              "position": {
                "start": {
                  "line": 1,
                  "column": 16
                },
                "end": {
                  "line": 1,
                  "column": 20
                },
                "indent": []
              }
            }
          ],
          "position": {
            "start": {
              "line": 1,
              "column": 15
            },
            "end": {
              "line": 1,
              "column": 21
            },
            "indent": []
          }
        },
        {
          "type": "text",
          "value": "name.txt",
          "position": {
            "start": {
              "line": 1,
              "column": 21
            },
            "end": {
              "line": 1,
              "column": 29
            },
            "indent": []
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
          "column": 29
        },
        "indent": []
      }
    }
  ],
  "position": {
    "start": {
      "line": 1,
      "column": 1
    },
    "end": {
      "line": 2,
      "column": 1
    }
  }
}
```

### Position

Setting `position: false` (default: `true`) disables positions on
nodes. Positions show where each node was originally located in the
document.

> **Careful! Disabling this will stop some plug-ins from working and
> will no longer show line/column information in warnings!**

The following document:

```markdown
Hello **world**!
```

And the below JavaScript:

```javascript
var ast = remark.parse(document, {
  "position": false
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
          "value": "Hello "
        },
        {
          "type": "strong",
          "children": [
            {
              "type": "text",
              "value": "world"
            }
          ]
        },
        {
          "type": "text",
          "value": "!"
        }
      ]
    }
  ]
}
```

### YAML

Setting `yaml: true` (default: `true`) enables raw YAML front matter to be
detected (thus ignoring markdown-like syntax).

The following document:

```markdown
---
title: YAML is Cool
---

# YAML is Cool
```

And the below JavaScript:

```javascript
var ast = remark.parse(document, {
  "yaml": true
});
```

Yields:

```json
{
  "type": "root",
  "children": [
    {
      "type": "yaml",
      "value": "title: YAML is Cool",
      "position": {
        "start": {
          "line": 1,
          "column": 1
        },
        "end": {
          "line": 3,
          "column": 4
        },
        "indent": [
          1,
          1
        ]
      }
    },
    {
      "type": "heading",
      "depth": 1,
      "children": [
        {
          "type": "text",
          "value": "YAML is Cool",
          "position": {
            "start": {
              "line": 5,
              "column": 3
            },
            "end": {
              "line": 5,
              "column": 15
            },
            "indent": []
          }
        }
      ],
      "position": {
        "start": {
          "line": 5,
          "column": 1
        },
        "end": {
          "line": 5,
          "column": 15
        },
        "indent": []
      }
    }
  ],
  "position": {
    "start": {
      "line": 1,
      "column": 1
    },
    "end": {
      "line": 6,
      "column": 1
    }
  }
}
```

## Stringify

### List Item Bullets

Setting `bullet: string` (`"-"`, `"*"`, or `"+"`, default: `"-"`) will
stringify list items in unordered lists using the provided character as
bullets.

The following document:

```markdown
- First level

  - Second level

    - Third level
```

And the below JavaScript:

```javascript
var ast = remark.parse(document);

remark.stringify(ast, {
  "bullet": "*"
});
```

Yields:

```markdown
*   First level

    *   Second level

        *   Third level
```

### Closed ATX Headings

Setting `closeAtx: true` (default: `false`) will stringify ATX headings
with additional hash-marks after the heading.

The following document:

```markdown
# First level

## Second level

### Third level
```

And the below JavaScript:

```javascript
var ast = remark.parse(document);

remark.stringify(ast, {
  "closeAtx": true
});
```

Yields:

```markdown
# First level #

## Second level ##

### Third level ###
```

### Emphasis Markers

Two options are provided to customise how slight- and strong emphasis
are compiled:

*   `emphasis: string` (`"_"` or `"*"`, default: `"_"`) will wrap slight
    emphasis in the provided character;

*   `strong: string` (`"_"` or `"*"`, default: `"*"`) will wrap strong
    emphasis with the provided character (twice).

The following document:

```markdown
*emphasis*

__strong__
```

And the below JavaScript:

```javascript
var ast = remark.parse(document);

remark.stringify(ast, {
  "emphasis": "_",
  "strong": "*"
});
```

Yields:

```markdown
_emphasis_

**strong**
```

### Encoding Entities

Setting `entities: true` (default: `false`) will
[encode](https://github.com/mathiasbynens/he#heencodetext-options) any symbols
that are not printable ASCII symbols and special HTML characters (`&`, `<`,
`>`, `"`, `'`, and `` ` ``).

When `true`, named entities are generated (`&` > `&amp;`); when `"numbers"`,
numbered entities are generated (`&` > `&#x26;`); when `"escape"`, only
special HTML characters are encoded (`&` > `&amp;`, but `ö` remains `ö`).

Although markdown does not need to encode HTML entities, they can be useful to
ensure an ASCII document.

The following document:

```markdown
AT&T, [AT&T](http://at&t.com "AT&T"), ![AT&T](http://at&t.com/fav.ico "AT&T")
```

And the below JavaScript:

```javascript
var ast = remark.parse(document);

remark.stringify(ast, {
  "entities": true
});
```

Yields:

```markdown
AT&amp;T, [AT&amp;T](http://at&amp;t.com "AT&amp;T"), ![AT&amp;T](http://at&amp;t.com/fav.ico "AT&amp;T")
```

### Fence

It's possible to customise how GFM code fences are compiled:

*   `fence: string` (`"~"` or ``"`"``, default: ``"`"``) will wrap code
    blocks in the provided character.

To render all code blocks with fences (the default behaviour is to only use
non-standard fences when a language-flag is present), use `fences: true`.

The following document:

````markdown
    ```javascript
    alert('Hello World!');
    ```
````

And the below JavaScript:

```javascript
var ast = remark.parse(document);

remark.stringify(ast, {
  "fence": "~"
});
```

Yields:

```markdown
    ~~~javascript
    alert('Hello World!');
    ~~~
```

### Fences

Setting `fences: true` (default: `false`) will stringify code blocks without
programming-language flags using heredoc-style fences.

To use different fence markers, use `fence: string`.

The following document:

```markdown
A code block:

    alert('Hello World!');
```

And the below JavaScript:

```javascript
var ast = remark.parse(document);

remark.stringify(ast, {
  "fences": true
});
```

Yields:

````markdown
    A code block:

    ```
    alert('Hello World!');
    ```
````

### List Item Indent

Setting `listItemIndent: "1"` (`"tab"`, `"mixed"`, or `"1"`, default: `"tab"`)
will stringify list items with a single space following the bullet.

The default, `"tab"`, will compile to bullets and spacing set to tab-stops
(multiples of 4).

The other value, `"mixed"`, uses `"tab"` when the list item spans multiple
lines, and `"1"` otherwise.

> **Note**: choosing `"tab"` results in the greatest support across
> vendors when mixing lists, block quotes, indented code, etcetera.

The following document:

```markdown
1. foo bar baz.

<!--  -->

99. foo bar baz.

<!--  -->

999. foo bar baz.

<!--  -->

1. foo bar baz.
   foo bar baz.

<!--  -->

99. foo bar baz.
    foo bar baz.

<!--  -->

999. foo bar baz.
     foo bar baz.
```

And the below JavaScript:

```javascript
var ast = remark.parse(document);

remark.stringify(ast, {
  "listItemIndent": "mixed"
});
```

Yields:

```markdown
1. foo bar baz.

<!--  -->

99. foo bar baz.

<!--  -->

999. foo bar baz.

<!--  -->

1.  foo bar baz.
    foo bar baz.

<!--  -->

99. foo bar baz.
    foo bar baz.

<!--  -->

999.    foo bar baz.
        foo bar baz.
```

### Loose Tables

Setting `looseTable: true` (default: `false`) will stringify GFM tables
with neither starting nor ending pipes.

The following document:

```markdown
| Hello | World  |
| :---- | -----: |
| How   |    are |
| you   | today? |
```

And the below JavaScript:

```javascript
var ast = remark.parse(document);

remark.stringify(ast, {
  "looseTable": true
});
```

Yields:

```markdown
Hello |  World
:---- | -----:
How   |    are
you   | today?
```

### List Marker Increase

Setting `incrementListMarker: false` (default: `true`) will stringify ordered
list items based on the first item’s marker and will not increment further
list items.

The following document:

```markdown
1.  Alpha;
2.  Bravo;
3.  Charley.


3.  Delta;
4.  Echo;
5.  Foxtrott.
```

And the below JavaScript:

```javascript
var ast = remark.parse(document);

remark.stringify(ast, {
  "incrementListMarker": false
});
```

Yields:

```markdown
1.  Alpha;
1.  Bravo;
1.  Charley.


3.  Delta;
3.  Echo;
3.  Foxtrott.
```

### Horizontal Rules

Three options are provided to customise how horizontal rules will be
compiled:

*   `rule: string` (`"-"`, `"*"`, or `"_"`, default: `"*"`) will stringify
    horizontal rules using the provided character as its bullets;

*   `ruleSpaces: true` (default: `false`) will stringify horizontal rules
    using spaces;

*   `ruleRepetition: number` (default: `3`) will stringify horizontal rules
    with the provided amount of repetitions.

The following document:

```markdown
A rule:

---
```

And the below JavaScript:

```javascript
var ast = remark.parse(document);

remark.stringify(ast, {
  "rule": "*",
  "ruleRepetition": 40,
  "ruleSpaces": true
});
```

Yields:

```markdown
A rule:

* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
```

### Setext Headings

Setting `setext: true` (default: `false`) will stringify headings as [Setext](http://en.wikipedia.org/wiki/Setext#Setext_tags) (underlines)
when possible.

Respectively, primary headings are compiled with a row of equals-signs
(`=`), and secondary headings with a row of dashes (`-`).

The following document:

```markdown
# First level

## Second level

### Third level
```

And the below JavaScript:

```javascript
var ast = remark.parse(document);

remark.stringify(ast, {
  "setext": true
});
```

Yields:

```markdown
First level
===========

Second level
------------

### Third level
```

### Spaced Tables

Setting `spacedTable: false` (default: `true`) will stringify GFM tables
without spaces after starting pipes, before ending pipes, and surrounding
delimiting pipes.

The following document:

```markdown
| Hello | World  |
| :---- | -----: |
| How   |    are |
| you   | today? |
```

And the below JavaScript:

```javascript
var ast = remark.parse(document);

remark.stringify(ast, {
  "spacedTable": false
});
```

Yields:

```markdown
|Hello| World|
|:----|-----:|
|How  |   are|
|you  |today?|
```
