Setting `commonmark: true` (default: `true`) enables:

- Paragraph parsing which causes indentation following a paragraph, which normally would be seen as code, to be part of the preceding paragraph;
- ATX-heading parsing (`# Hash headings`) which requires spacing after initial hashes, and before closing hashes;
- Setext-heading parsing (`Underline headings\n---`) which does not allow these headings when directly following a paragraph;
- Horizontal line to interupt blockquotes.
