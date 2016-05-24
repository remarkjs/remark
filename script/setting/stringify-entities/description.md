Setting `entities: true` (default: `false`) will
[encode](https://github.com/mathiasbynens/he#heencodetext-options) any symbols
that are not printable ASCII symbols and special HTML characters (`&`, `<`,
`>`, `"`, `'`, and `` ` ``).

When `true`, named entities are generated (`&` > `&amp;`).  When
`"numbers"`, numbered entities are generated (`&` > `&#x26;`).  When
`"escape"`, special HTML characters are encoded (`&` > `&amp;`, `ö`
does not).

Although markdown does not need to encode HTML entities, they can be useful to
make sure the compiled document is in ASCII.
