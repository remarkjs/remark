# remark(1) -- Markdown processor

## SYNOPSIS

`remark` \[`options`] &lt;_pathspec_...>

## DESCRIPTION

**remark** is a markdown processor powered by plugins.

&lt;_pathspec_...> refers to files to process.  Fileglobs (e.g., `*.md`)
can be given to add all matching files.  Directories can be given (e.g. `dir`
to add `dir/readme.md` and `dir/sub/history.mkd`) to add files with a known
markdown extension (see the `-e`, `--ext` flag).

Logs verbose debugging information when `$DEBUG` is set to `"*"`.

## OPTIONS

### `-h`, `--help`

```sh
remark --help
```

Output short usage information.

### `-v`, `--version`

```sh
remark --version
```

Output CLI version number.

### `-o`, `--output` \[_path_]

```sh
remark . --output
remark . --output doc
remark readme.md --output doc/foo.bar
```

Specify output.

*   If output is **not** given and one file is processed, the file is written
    to **stdout**(4). See `--no-stdout` to disable this behaviour;

*   Otherwise, if output is **not** given and multiple files are processed,
    files are neither written to **stdout**(4) nor to the file-system;

*   Otherwise, if output is given but **without** path, input files are
    overwritten;

*   Otherwise, if a path to an existing directory is given, files are written
    to that directory;

*   Otherwise, if one file is processed and the parent directory of the given
    path exists, the file is written to the given path;

*   Otherwise, a fatal error is thrown.

### `-c`, `--config-path` &lt;_path_>

```sh
remark . --config-path remarkrc.json
```

Specify configuration location. This loads an **remarkrc**(5) file which cannot
be detected (either because `--no-rc` is given or because it has a different
name) in addition to other detected files.

### `-i`, `--ignore-path` &lt;_path_>

```sh
remark . --ignore-path .gitignore
```

Specify ignore location. This loads an **remarkignore**(5) file which cannot be
detected (either because `--no-ignore` is given or because it has a different
name) in addition to other detected files.

### `-s`, `--setting` &lt;_settings_>

```sh
remark readme.md --setting commonmark:true
```

Specify settings (see **remarksetting**(7)). This must be a valid JSON object
except for a few differences. See **remarkconfig**(7) COMMAND LINE SETTINGS
for more information.

### `-u`, `--use` &lt;_plugin_>

```sh
remark readme.md --use man
```

Specify a plug-in to use, optionally with options. See **remarkplugin**(7)
COMMAND LINE USAGE for more information.

### `-e`, `--ext` &lt;_extensions_>

```sh
remark . --ext doc
```

Specify one or more extensions to include when searching for files.
This will add the given `extensions` to the internal list, which includes
`'md'`, `'markdown'`, `'mkd'`, `'mkdn'`, `'mkdown'`, and `'ron'`.

The given `extensions` can be comma or semi-colon separated.

### `-w`, `--watch`

```sh
remark . -w
```

Watch all files and reprocess when they change.

When watching files which would normally regenerate,
this behaviour is ignored until the watch is closed.

```sh
$ remark --no-rc readme.md -oqw
# Watching... (press CTRL+C to exit)
# Warning: remark does not overwrite watched files until exit.
# Messages and other files are not affected.
```

The watch is stopped when `SIGINT` is received (usually done by pressing
`CTRL-C`).

### `-t`, `--tree`

```sh
remark --tree < input.json > output.json
```

Read input as a syntax tree instead of markdown and write output as a
syntax tree instead of markdown.

### `--tree-in`

```sh
remark --tree-in < input.json > output.md
```

Read input as a syntax tree instead of markdown.

### `--tree-out`

```sh
remark --tree-out < input.md > output.json
```

Write output as a syntax tree instead of markdown.

### `-q`, `--quiet`

```sh
remark readme.md --quiet
```

Do not output non-essential text, only warnings and errors.

### `-S`, `--silent`

```sh
remark readme.md --silent
```

Do not output non-essential text or warning, only errors.

### `-f`, `--frail`

```sh
remark readme.md --frail
```

Exit with a status code of `1` if warnings or errors occur,
instead of the default of only exiting with `1` on errors.

### `--file-path` &lt;_path_>

```sh
remark --file-path readme.md < readme.md > doc/out.md
```

Process the piped-in document as if it was a file at `path`.

### `--no-stdout`

```sh
remark readme.md --no-stdout
```

Do not write a processed file to **stdout**(4).

### `--no-color`

```sh
remark readme.md --no-color
```

Disable ANSI codes in output.

### `--no-rc`

```sh
remark readme.md --no-rc
```

Disables configuration from **remarkrc**(5) files. This does not apply to
explicitly provided files through `-c`, `--config-path`.

### `--no-ignore`

```sh
remark . --no-ignore
```

Disables configuration from **remarkignore**(5) files. This does not apply to
explicitly provided files through `-i`, `--ignore-path`.

### `--`

```sh
remark . --
```

If a `--` argument is found, argument parsing is stopped.

## DIAGNOSTICS

`remark` exits 0 on success, and 1 otherwise.

## BUGS

<https://github.com/wooorm/remark/issues>

## SEE ALSO

**remarkignore**(5), **remarkrc**(5), **remarkconfig**(7),
**remarkplugin**(7), **remarksetting**(7)
