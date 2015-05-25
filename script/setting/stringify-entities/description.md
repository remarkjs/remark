Setting `entities: true` (default: `false`) will
[encode](https://github.com/mathiasbynens/he#heencodetext-options) any symbols
that aren’t printable ASCII symbols and `&`, `<`, `>`, `"`, `'`, and `` ` ``.

When `true`, named entities are generated (`&` > `&amp;`); when `"numbers"`,
numbered entities are generated (`&` > `&#x26;`).

Although markdown does not need to encode HTML entities, they can be useful to
ensure an ASCII document.
