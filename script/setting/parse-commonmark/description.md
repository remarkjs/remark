Setting `commonmark: true` (default: `false`):

*   Adds support for empty lines to split **Blockquotes**;

*   Adds support for parentheses (`(` and `)`) as delimiters for **Link** and
    **Image** titles;

*   Adds support for parsing any escaped
    [ASCII-punctuation](http://spec.commonmark.org/0.18/#backslash-escapes)
    character as **Escapes**;

*   Adds support for parsing ordered list-items with a closing
    parenthesis (`)`);

*   Adds support for link reference definitions (and footnote reference
    definitions, when in `footnotes: true` mode) in blockquotes;

*   Removes support for **Code** directly following a **Paragraph**;

*   Removes support for ATX-headings (`# Hash headings`) without spacing
    after initial hashes or and before closing hashes;

*   Removes support for Setext-headings (`Underline headings\n---`) when
    directly following a paragraph;

*   Removes support for new lines in **Link** and **Image** titles;

*   Removes support for white space in **Link** and **Image** URLs when not
    enclosed in angle brackets (`<` and `>`);

*   Removes support for lazy **Blockquote** continuation—lines not preceded by
    a closing angle bracket (`>`)—for **List**s, **Code**, and
    **HorizontalRule**.
