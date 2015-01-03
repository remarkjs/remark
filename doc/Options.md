![mdast](https://cdn.rawgit.com/wooorm/mdast/master/logo.svg)

# Options

This page contains information and usage examples regarding available options for [`mdast.parse()`](https://github.com/wooorm/mdast#mdastparsevalue-options) and [`mdast.stringify()`](https://github.com/wooorm/mdast#mdaststringifyast-options).

Information on **mdast** itself is available in the project’s [Readme.md](https://github.com/wooorm/mdast#readme).

## Parse

### Breaks

Setting `breaks: true` \(default: `false`\) explicitly exposes new line characters in the AST.

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
          "value": "A"
        },
        {
          "type": "break"
        },
        {
          "type": "text",
          "value": "paragraph."
        }
      ]
    }
  ],
  "footnotes": null
}
```

### Footnotes

Setting `footnotes: true` \(default: `false`\) enables inline\- and reference\-style footnotes.

Footnotes are wrapped in square brackets, and preceded by a caret \(`^`\).

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
          "value": "Something something"
        },
        {
          "type": "footnote",
          "id": "footnote-1"
        },
        {
          "type": "text",
          "value": "."
        }
      ]
    },
    {
      "type": "paragraph",
      "children": [
        {
          "type": "text",
          "value": "And something else"
        },
        {
          "type": "footnote",
          "id": "1"
        },
        {
          "type": "text",
          "value": "."
        }
      ]
    }
  ],
  "footnotes": {
    "1": [
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "value": "This reference style footnote can contains paragraphs."
          }
        ]
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
                    "value": "and lists"
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "footnote-1": [
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "value": "or something?"
          }
        ]
      }
    ]
  }
}
```

### GitHub Flavoured Markdown

Setting `gfm: true` \(default: `true`\) enables:

- Parsing of fenced code blocks;
- Better paragraph parsing;
- Automatic URL detection;
- Deletions \(strikethrough\).

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
  ],
  "footnotes": null
}
```

### Pedantic

Setting `pedantic: true` \(default: `false`\) enables emphasis and strongness inside words. It’s mostly not what you want.

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
          "value": "Check out some"
        },
        {
          "type": "emphasis",
          "children": [
            {
              "type": "text",
              "value": "file"
            }
          ]
        },
        {
          "type": "text",
          "value": "name.txt"
        }
      ]
    }
  ],
  "footnotes": null
}
```

### Tables

Setting `tables: true` \(default: `true`\) enables fenced and loose tables, as in, tables with or without leading/closing pipes.

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
                  "value": "Header 1"
                }
              ]
            },
            {
              "type": "tableCell",
              "children": [
                {
                  "type": "text",
                  "value": "Header 2"
                }
              ]
            }
          ]
        },
        {
          "type": "tableRow",
          "children": [
            {
              "type": "tableCell",
              "children": [
                {
                  "type": "text",
                  "value": "Cell 1"
                }
              ]
            },
            {
              "type": "tableCell",
              "children": [
                {
                  "type": "text",
                  "value": "Cell 2"
                }
              ]
            }
          ]
        },
        {
          "type": "tableRow",
          "children": [
            {
              "type": "tableCell",
              "children": [
                {
                  "type": "text",
                  "value": "Cell 3"
                }
              ]
            },
            {
              "type": "tableCell",
              "children": [
                {
                  "type": "text",
                  "value": "Cell "
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "footnotes": null
}
```

## Stringify

### List Item Bullets

Setting `bullet: string` \(`"-"`, `"*"`, or `"+"`, default: `"-"`\) will stringify list\-items in unordered lists using the provided character as its bullet.

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

### Emphasis Markers

Two options are provided to customise how slight\- and strong emphasis are stringified:

- `emphasis: string` \(`"_"` or `"*"`, default: `"_"`\) will wrap slight emphasis in the provided character;
- `strong: string` \(`"_"` or `"*"`, default: `"*"`\) will wrap strong emphasis with the provided character \(twice\).

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

- `fence: string` \(`"~"` or ``"`"``, default: ``"`"``\) will wrap code in the provided character;

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

Setting `fences: true` \(default: `false`\) will stringify code blocks without programming\-language flags using heredoc\-style fences.

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

### Inline Footnotes

Setting `referenceFootnotes: false` \(default: `true`\) will stringify footnotes with inline content inline.

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

Setting `referenceLinks: true` \(default: `false`\) will stringify links using link references and link definitions.

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

- `rule: string` \(`"-"`, `"*"`, or `"_"`, default: `"*"`\) will stringify horizontal rules using the provided character as its bullets;
- `ruleSpaces: true` \(default: `false`\) will stringify horizontal rules using spaces;
- `ruleRepetition: number` \(default: `3`\) will stringify horizontal rules with the provided amount of repetitions.

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

Setting `setext: true` \(default: `false`\) will stringify primary and secondary headings using [Setext](http://en.wikipedia.org/wiki/Setext#Setext_tags)\-style using underlines.
Respectively, primary headings are stringified with a row of equals\-signs \(`=`\), and secondary headings with a row of dashes \(`-`\).

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
