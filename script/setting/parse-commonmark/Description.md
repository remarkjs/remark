Setting `commonmark: true` (default: `true`) enables:

- Paragraph parsing which causes indentation following a paragraph, which normally would be seen as code, to be part of the preceding paragraph;
- ATX-heading parsing (`# Hash headings`) which requires spacing after initial hashes, and before closing hashes;
- Setext-heading parsing (`Underline headings\n---`) which does not allow these headings when directly following a paragraph;
- Empty lines to split blockquotes;
- Stricter blockquote parsing when you’re lazy: a list, code block,
  fenced code block, or horizontal rule when not preceded by
  a closing angle bracket (`>`) is **not** part of the blockquote.
