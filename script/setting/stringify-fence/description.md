It's possible to customise how GFM code fences are stringified:

*   `fence: string` (`"~"` or ``"`"``, default: ``"`"``) will wrap code
    blocks in the provided character.

To render all code blocks with fences (the default behavior is to only use
non-standard fences when a language-flag is present), use `fences: true`.
