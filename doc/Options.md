![mdast](https://cdn.rawgit.com/wooorm/mdast/master/logo.svg)

# Options

This page contains information and usage examples regarding available options for [`mdast.parse()`](https://github.com/wooorm/mdast/blob/master/doc/mdast.3.md#mdastparsefile-options) and [`mdast.stringify()`](https://github.com/wooorm/mdast/blob/master/doc/mdast.3.md#mdaststringifyast-options).

Information on **mdast** itself is available in the project’s [Readme.md](https://github.com/wooorm/mdast#readme).

## Table of Contents

*   [Parse](#parse)
    *   [Breaks](#breaks)
    *   [CommonMark](#commonmark)
    *   [Footnotes](#footnotes)
    *   [GitHub Flavoured Markdown](#github-flavoured-markdown)
    *   [Pedantic](#pedantic)
    *   [YAML](#yaml)
*   [Stringify](#stringify)
    *   [List Item Bullets](#list-item-bullets)
    *   [Closed ATX Headings](#closed-atx-headings)
    *   [Emphasis Markers](#emphasis-markers)
    *   [Fence](#fence)
    *   [Fences](#fences)
    *   [Loose Tables](#loose-tables)
    *   [Reference Links and Images](#reference-links-and-images)
    *   [Horizontal Rules](#horizontal-rules)
    *   [Setext Headings](#setext-headings)
    *   [Spaced Tables](#spaced-tables)

## Parse

### Breaks

Setting `breaks: true` (default: `false`) exposes new line characters inside [**Paragraph**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#paragraph)s as [**Break**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#break)s.

The following document:

    A
    paragraph.

And the below JavaScript:

```javascript
var ast = mdast.parse(document, {
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
            }
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
            }
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
          "line": 2,
          "column": 11
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
      "line": 3,
      "column": 1
    }
  }
}
```

### CommonMark

Setting `commonmark: true` (default: `false`):

*   Adds support for empty lines to split [**Blockquote**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#blockquote)s;
*   Adds support for parentheses (`(` and `)`) as delimiters for [**Link**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#link) and [**Image**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#image) titles;
*   Adds support for parsing any escaped [ASCII-punctuation](http://spec.commonmark.org/0.18/#backslash-escapes) character as [**Escape**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#escape)s;
*   Adds support for parsing ordered list-items with a closing parenthesis (`)`);
*   Adds support for link reference definitions (and footnote reference definitions, when in `footnotes: true` mode) in blockquotes;
*   Removes support for [**Code**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#code) directly following a [**Paragraph**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#paragraph);
*   Removes support for ATX-headings (`# Hash headings`) without spacing after initial hashes or and before closing hashes;
*   Removes support for Setext-headings (`Underline headings\n---`) when directly following a paragraph;
*   Removes support for new lines in [**Link**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#link) and [**Image**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#image) titles;
*   Removes support for white space in [**Link**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#link) and [**Image**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#image) URLs when not enclosed in angle brackets (`<` and `>`);
*   Removes support for lazy [**Blockquote**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#blockquote) continuation—lines not preceded by a closing angle bracket (`>`)—for [**List**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#list)s, [**Code**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#code), and [**HorizontalRule**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#horizontalrule)s.

The following document:

    This is a paragraph
        and this is also part of the preceding paragraph.

And the below JavaScript:

```javascript
var ast = mdast.parse(document, {
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
          "line": 2,
          "column": 54
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
      "line": 3,
      "column": 1
    }
  }
}
```

### Footnotes

Setting `footnotes: true` (default: `false`) enables inline- and reference-style footnotes.

Footnotes are wrapped in square brackets, and preceded by a caret (`^`).

It’s possible to reference other footnotes inside footnotes.

The following document:

    Something something[^or something?].

    And something else[^1].

    [^1]: This reference style footnote can contains paragraphs.

       - and lists

And the below JavaScript:

```javascript
var ast = mdast.parse(document, {
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
            }
          }
        },
        {
          "type": "footnote",
          "id": "2",
          "position": {
            "start": {
              "line": 1,
              "column": 20
            },
            "end": {
              "line": 1,
              "column": 36
            }
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
          "column": 37
        }
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
            }
          }
        },
        {
          "type": "footnote",
          "id": "1",
          "position": {
            "start": {
              "line": 3,
              "column": 19
            },
            "end": {
              "line": 3,
              "column": 23
            }
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
            }
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
        }
      }
    }
  ],
  "footnotes": {
    "1": {
      "type": "footnoteDefinition",
      "id": "1",
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
                }
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
            }
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
                        }
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
                    }
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
                }
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
            }
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
        }
      }
    },
    "2": {
      "type": "footnoteDefinition",
      "id": "2",
      "children": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "value": "or something?",
              "position": {
                "start": {
                  "line": 1,
                  "column": 22
                },
                "end": {
                  "line": 1,
                  "column": 35
                }
              }
            }
          ],
          "position": {
            "start": {
              "line": 1,
              "column": 22
            },
            "end": {
              "line": 1,
              "column": 35
            }
          }
        }
      ]
    }
  },
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

*   [Fenced](https://help.github.com/articles/github-flavored-markdown/#fenced-code-blocks) code blocks;
*   [Autolinking](https://help.github.com/articles/github-flavored-markdown/#url-autolinking) of URLs;
*   [Deletions](https://help.github.com/articles/github-flavored-markdown/#strikethrough) (strikethrough);
*   [Task](https://help.github.com/articles/writing-on-github/#task-lists) lists;
*   [Tables](https://help.github.com/articles/github-flavored-markdown/#tables).

The following document:

    hello ~~hi~~ world

And the below JavaScript:

```javascript
var ast = mdast.parse(document, {
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
            }
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
                }
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
            }
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
          "column": 19
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
      "line": 2,
      "column": 1
    }
  }
}
```

### Pedantic

Setting `pedantic: true` (default: `false`):

*   Adds support for emphasis and strongness, with underscores (`_`), inside words;
*   Adds support for different list bullets (`*`, `-`, `+`) for the same list (when in `commonmark: true` mode, the same goes for both ordered list delimiters: `.` and `)`);
*   Removes less spaces in list-items (a maximum of four instead of the whole indent).

The following document:

    Check out some_file_name.txt

And the below JavaScript:

```javascript
var ast = mdast.parse(document, {
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
            }
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
                }
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
            }
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
          "column": 29
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
      "line": 2,
      "column": 1
    }
  }
}
```

### YAML

Setting `yaml: true` (default: `true`) enables raw YAML front matter to be detected (thus ignoring markdown-like syntax).

The following document:

    ---
    title: YAML is Cool
    ---

    # YAML is Cool

And the below JavaScript:

```javascript
var ast = mdast.parse(document, {
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
        }
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
            }
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
      "line": 6,
      "column": 1
    }
  }
}
```

## Stringify

### List Item Bullets

Setting `bullet: string` (`"-"`, `"*"`, or `"+"`, default: `"-"`) will stringify list items in unordered lists using the provided character as bullets.

The following document:

    - First level

      - Second level

        - Third level

And the below JavaScript:

```javascript
var ast = mdast.parse(document);

mdast.stringify(ast, {
  "bullet": "*"
});
```

Yields:

    *   First level

        *   Second level

            *   Third level

### Closed ATX Headings

Setting `closeAtx: true` (default: `false`) will stringify ATX headings with additional hash-marks after the heading.

The following document:

    # First level

    ## Second level

    ### Third level

And the below JavaScript:

```javascript
var ast = mdast.parse(document);

mdast.stringify(ast, {
  "closeAtx": true
});
```

Yields:

    # First level #

    ## Second level ##

    ### Third level ###

### Emphasis Markers

Two options are provided to customise how slight- and strong emphasis are stringified:

*   `emphasis: string` (`"_"` or `"*"`, default: `"_"`) will wrap slight emphasis in the provided character;
*   `strong: string` (`"_"` or `"*"`, default: `"*"`) will wrap strong emphasis with the provided character (twice).

The following document:

    *emphasis*

    __strong__

And the below JavaScript:

```javascript
var ast = mdast.parse(document);

mdast.stringify(ast, {
  "emphasis": "_",
  "strong": "*"
});
```

Yields:

    _emphasis_

    **strong**

### Fence

It's possible to customise how GFM code fences are stringified:

*   `fence: string` (`"~"` or ``"`"``, default: ``"`"``) will wrap code blocks in the provided character.

To render all code blocks with fences (the default behavior is to only use non-standard fences when a language-flag is present), use [`fences: true`](#fences).

The following document:

    ```javascript
    alert('Hello World!');
    ```

And the below JavaScript:

```javascript
var ast = mdast.parse(document);

mdast.stringify(ast, {
  "fence": "~"
});
```

Yields:

    ~~~javascript
    alert('Hello World!');
    ~~~

### Fences

Setting `fences: true` (default: `false`) will stringify code blocks without programming-language flags using heredoc-style fences.

To use differen fence markers, use [`fence: string`](#fence).

The following document:

    A code block:

        alert('Hello World!');

And the below JavaScript:

```javascript
var ast = mdast.parse(document);

mdast.stringify(ast, {
  "fences": true
});
```

Yields:

    A code block:

    ```
    alert('Hello World!');
    ```

### Loose Tables

Setting `looseTable: true` (default: `false`) will stringify GFM tables with neither starting nor ending pipes.

The following document:

    | Hello | World  |
    | :---- | -----: |
    | How   |    are |
    | you   | today? |

And the below JavaScript:

```javascript
var ast = mdast.parse(document);

mdast.stringify(ast, {
  "looseTable": true
});
```

Yields:

    Hello |  World
    :---- | -----:
    How   |    are
    you   | today?

### Reference Links and Images

Setting `referenceLinks: true` (default: `false`) will stringify links using link references and link definitions.
Setting `referenceImages: true` (default: `false`) will do the same for images.

The following document:

    Lorem ipsum dolor sit [amet](http://amet.com "Amet"), consectetur ![adipiscing](adipiscing.png "Adipiscing") elit.

And the below JavaScript:

```javascript
var ast = mdast.parse(document);

mdast.stringify(ast, {
  "referenceLinks": true,
  "referenceImages": true
});
```

Yields:

    Lorem ipsum dolor sit [amet][1], consectetur ![adipiscing][2] elit.

    [1]: http://amet.com "Amet"
    [2]: adipiscing.png "Adipiscing"

### Horizontal Rules

Three options are provided to customise how horizontal rules will be stringified:

*   `rule: string` (`"-"`, `"*"`, or `"_"`, default: `"*"`) will stringify horizontal rules using the provided character as its bullets;
*   `ruleSpaces: true` (default: `false`) will stringify horizontal rules using spaces;
*   `ruleRepetition: number` (default: `3`) will stringify horizontal rules with the provided amount of repetitions.

The following document:

    A rule:

    ---

And the below JavaScript:

```javascript
var ast = mdast.parse(document);

mdast.stringify(ast, {
  "rule": "*",
  "ruleRepetition": 40,
  "ruleSpaces": true
});
```

Yields:

    A rule:

    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

### Setext Headings

Setting `setext: true` (default: `false`) will stringify primary and secondary headings using [Setext](http://en.wikipedia.org/wiki/Setext#Setext_tags)-style headings (underlines).

Respectively, primary headings are stringified with a row of equals-signs (`=`), and secondary headings with a row of dashes (`-`).

The following document:

    # First level

    ## Second level

    ### Third level

And the below JavaScript:

```javascript
var ast = mdast.parse(document);

mdast.stringify(ast, {
  "setext": true
});
```

Yields:

    First level
    ===========

    Second level
    ------------

    ### Third level

### Spaced Tables

Setting `spacedTable: false` (default: `true`) will stringify GFM tables without spaces after starting pipes, before ending pipes, and surrounding delimiting pipes.

The following document:

    | Hello | World  |
    | :---- | -----: |
    | How   |    are |
    | you   | today? |

And the below JavaScript:

```javascript
var ast = mdast.parse(document);

mdast.stringify(ast, {
  "spacedTable": false
});
```

Yields:

    |Hello| World|
    |:----|-----:|
    |How  |   are|
    |you  |today?|
