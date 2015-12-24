# remarkignore(5) -- remark ignore files

## SYNOPSIS

**.remarkignore**

## DESCRIPTION

When **remark**(1) searches for applicable files, you can tell it to ignore
certain globs by placing an _.remarkignore_ file in the current working
directory or its ancestral directories.

Unlike **remarkrc**(5) configuration files, **remarkignore**(5) files do not
cascade: when one is found (or given), the program stops looking for further
files.

## FILES

Each line in a **remarkignore**(5) file provides a pattern which describes to
**remark** whether or not to process a given path.

*   Lines are trimmed of initial and final white space;

*   Empty lines are ignored;

*   Lines which start with an octothorp (`#`) are ignored;

*   Lines which start with a interrogation-mark (`!`) negate, thus re-adding
    a previously ignored file path;

For documentation regarding the glob engine itself, such as wild-cards
(`*`, `?`), brace expressions (`{one,two}`), see
[isaacs/minimatch](https://github.com/isaacs/minimatch).

You can pass a **gitignore**(5) file to **remark**(1), because it has the same
format as **remarkignore**(5):

```bash
remark --ignore-path .gitignore
```

**remark**(1) searches for files with  _.md_, _.mkd_, _.mkdn_, _.mkdown_,
_.markdown_, or _.ron_ as extension.  Other files can be explicitly provided
to **remark**(1), or an `extension` can be given to **remark**(1) using the
`--extension, -e` flag.

In addition to patterns in **remarkignore**(5) files, _node\_modules/\*\*_ are
always excluded.

Unless provided directly to **remark**(1), hidden directories (such as _.git_)
are excluded.

## BUGS

<https://github.com/wooorm/remark/issues>

## SEE ALSO

**remark**(1), **remarkrc**(5), **remarkconfig**(7), **remarksetting**(7),
**gitignore**(5).

## AUTHOR

Written by Titus Wormer <mailto:tituswormer@gmail.com>
