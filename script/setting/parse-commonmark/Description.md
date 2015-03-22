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
