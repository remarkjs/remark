It's possible to customise how GFM code fences are compiled:

*   `fence: string` (`"~"` or ``"`"``, default: ``"`"``) will wrap code
    blocks in the provided character.

To compile all code blocks with fences (the default behaviour is to only use
non-standard fences when a language-flag is present), use `fences: true`.
