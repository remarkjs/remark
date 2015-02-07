![mdast](https://cdn.rawgit.com/wooorm/mdast/master/logo.svg)

# Options

This page contains information and usage examples regarding available options for [`mdast.parse()`](https://github.com/wooorm/mdast#mdastparsevalue-options) and [`mdast.stringify()`](https://github.com/wooorm/mdast#mdaststringifyast-options).

Information on **mdast** itself is available in the project’s [Readme.md](https://github.com/wooorm/mdast#readme).

## Parse

### Breaks

Setting `breaks: true` (default: `false`) explicitly exposes new line characters in the AST.

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
      "line": 2,
      "column": 11
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
          "children": [
            {
              "type": "listItem",
              "loose": false,
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
      "line": 3,
      "column": 24
    }
  }
}
```

### GitHub Flavoured Markdown

Setting `gfm: true` (default: `true`) enables:

- Parsing of fenced code blocks;
- Automatic URL detection;
- Deletions (strikethrough).

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
      "line": 1,
      "column": 19
    }
  }
}
```

### Pedantic

Setting `pedantic: true` (default: `false`) enables:

- Emphasis and strongness inside words;
- Allows different ordered-list bullets in the same list;
- Removes less spaces in list-items (a maximum of four instead of the whole indent).

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
      "line": 1,
      "column": 29
    }
  }
}
```

### Tables

Setting `tables: true` (default: `true`) enables fenced and loose tables, as in, tables with or without leading/closing pipes.

The following document:

    Header 1 | Header 2
    :------- | -------:
    Cell 1   | Cell 2
    Cell 3   | Cell

And the below JavaScript:

```javascript
var ast = mdast.parse(document, {
  "tables": true
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
              "children": [
                {
                  "type": "text",
                  "value": "Header 1",
                  "position": {
                    "start": {
                      "line": 1,
                      "column": 1
                    },
                    "end": {
                      "line": 1,
                      "column": 9
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
                  "column": 9
                }
              }
            },
            {
              "type": "tableCell",
              "children": [
                {
                  "type": "text",
                  "value": "Header 2",
                  "position": {
                    "start": {
                      "line": 1,
                      "column": 12
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
                  "column": 12
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
              "column": 1
            },
            "end": {
              "line": 1,
              "column": 20
            }
          }
        },
        {
          "type": "tableRow",
          "children": [
            {
              "type": "tableCell",
              "children": [
                {
                  "type": "text",
                  "value": "Cell 1",
                  "position": {
                    "start": {
                      "line": 3,
                      "column": 1
                    },
                    "end": {
                      "line": 3,
                      "column": 7
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
                  "column": 7
                }
              }
            },
            {
              "type": "tableCell",
              "children": [
                {
                  "type": "text",
                  "value": "Cell 2",
                  "position": {
                    "start": {
                      "line": 3,
                      "column": 12
                    },
                    "end": {
                      "line": 3,
                      "column": 18
                    }
                  }
                }
              ],
              "position": {
                "start": {
                  "line": 3,
                  "column": 12
                },
                "end": {
                  "line": 3,
                  "column": 18
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
              "column": 18
            }
          }
        },
        {
          "type": "tableRow",
          "children": [
            {
              "type": "tableCell",
              "children": [
                {
                  "type": "text",
                  "value": "Cell 3",
                  "position": {
                    "start": {
                      "line": 4,
                      "column": 1
                    },
                    "end": {
                      "line": 4,
                      "column": 7
                    }
                  }
                }
              ],
              "position": {
                "start": {
                  "line": 4,
                  "column": 1
                },
                "end": {
                  "line": 4,
                  "column": 7
                }
              }
            },
            {
              "type": "tableCell",
              "children": [
                {
                  "type": "text",
                  "value": "Cell ",
                  "position": {
                    "start": {
                      "line": 4,
                      "column": 12
                    },
                    "end": {
                      "line": 4,
                      "column": 17
                    }
                  }
                }
              ],
              "position": {
                "start": {
                  "line": 4,
                  "column": 12
                },
                "end": {
                  "line": 4,
                  "column": 17
                }
              }
            }
          ],
          "position": {
            "start": {
              "line": 4,
              "column": 1
            },
            "end": {
              "line": 4,
              "column": 17
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
          "line": 4,
          "column": 17
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
      "line": 4,
      "column": 17
    }
  }
}
```

## Stringify

### List Item Bullets

Setting `bullet: string` (`"-"`, `"*"`, or `"+"`, default: `"-"`) will stringify list-items in unordered lists using the provided character as its bullet.

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

    * First level

      * Second level

        * Third level

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

- `emphasis: string` (`"_"` or `"*"`, default: `"_"`) will wrap slight emphasis in the provided character;
- `strong: string` (`"_"` or `"*"`, default: `"*"`) will wrap strong emphasis with the provided character (twice).

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

- `fence: string` (`"~"` or ``"`"``, default: ``"`"``) will wrap code in the provided character;

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
    ----- | -----:
    How   |    are
    you   | today?

### Inline Footnotes

Setting `referenceFootnotes: false` (default: `true`) will stringify footnotes with inline content inline.

The following document:

    Some text[^1].

    [^1]: And a footnote.

And the below JavaScript:

```javascript
var ast = mdast.parse(document, {
  "footnotes": true
});

mdast.stringify(ast, {
  "referenceFootnotes": false
});
```

Yields:

    Some text[^And a footnote.].

### Reference Links

Setting `referenceLinks: true` (default: `false`) will stringify links using link references and link definitions.

The following document:

    Lorem ipsum dolor sit [amet](http://amet.com "Amet").

And the below JavaScript:

```javascript
var ast = mdast.parse(document);

mdast.stringify(ast, {
  "referenceLinks": true
});
```

Yields:

    Lorem ipsum dolor sit [amet][1].

    [1]: http://amet.com "Amet"

### Horizontal Rules

Three options are provided to customise how horizontal rules will be stringified:

- `rule: string` (`"-"`, `"*"`, or `"_"`, default: `"*"`) will stringify horizontal rules using the provided character as its bullets;
- `ruleSpaces: true` (default: `false`) will stringify horizontal rules using spaces;
- `ruleRepetition: number` (default: `3`) will stringify horizontal rules with the provided amount of repetitions.

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

Setting `setext: true` (default: `false`) will stringify primary and secondary headings using [Setext](http://en.wikipedia.org/wiki/Setext#Setext_tags)-style using underlines.
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

Setting `spacedTable: false` (default: `true`) will stringify GFM tables without spaced after starting pipes, before ending pipes, and surrounding delimiting pipes.

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
    |-----|-----:|
    |How  |   are|
    |you  |today?|
