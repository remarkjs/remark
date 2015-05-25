# mdastignore(5) -- mdast ignore files

## SYNOPSIS

**.mdastignore**

## DESCRIPTION

When **mdast**(1) searches for applicable files, you can tell it to ignore
certain globs by placing an _.mdastignore_ file in the current working
directory or its ancestral directories.

Unlike **mdastrc**(5) configuration files, **mdastignore**(5) files do not
cascade: when one is found (or given), the program stops looking for further
files.

## FILES

Each line in a **mdastignore**(5) file provides a pattern which describes to
**mdast** whether or not to process a given path.

*   Lines are trimmed of initial and final white space;

*   Empty lines are ignored;

*   Lines which start with an octothorp (`#`) are ignored;

*   Lines which start with a interrogation-mark (`!`) negate, thus re-adding
    a previously ignored file path;

For documentation regarding the glob engine itself, such as wild-cards
(`*`, `?`), brace expressions (`{one,two}`), see **minimist**(1).

You can pass a **gitignore**(5) file to **mdast**(1), because it has the same
format as **mdastignore**(5):

```bash
mdast --ignore-path .gitignore
```

**mdast**(1) searches for files with  _.md_, _.mkd_, _.mkdn_, _.mkdown_,
_.markdown_, or _.ron_ as extension.  Other files can be explicitly provided
to **mdast**(1), or an `extension` can be given to **mdast**(1) using the
`--extension, -e` flag.

In addition to patterns in **mdastignore**(5) files, _node_modules/\*\*_ are
always excluded.

Unless provided directly to **mdast**(1), hidden directories (such as _.git_)
are excluded.

## BUGS

<https://github.com/wooorm/mdast/issues>

## SEE ALSO

**mdast**(1), **mdastrc**(5), **mdastconfig**(7).

## AUTHOR

Written by Titus Wormer <mailto:tituswormer@gmail.com>
