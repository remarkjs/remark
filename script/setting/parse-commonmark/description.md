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

*   ATX-headings (`# Hash headings`) without spacing after opening hashes
    or and before closing hashes;

*   Setext headings (`Underline headings\n---`) when following a paragraph;

*   Newlines in **Link** and **Image** titles;

*   White space in **Link** and **Image** URLs in auto-links (links in
    brackets, `<` and `>`);

*   Lazy **Blockquote** continuation—lines not preceded by a closing angle
    bracket (`>`)—for **List**s, **Code**, and **ThematicBreak**.
