# mdast(1) -- Markdown processor

## SYNOPSIS

`mdast` \[`options`] &lt;_file|dir_ _..._>

## DESCRIPTION

**mdast** is a markdown processor powered by plugins.

Logs verbose debugging information when `$DEBUG` is set to `"mdast"`.

## OPTIONS

### `-h`, `--help`

```sh
mdast --help
```

Output short usage information.

### `-v`, `--version`

```sh
mdast --version
```

Output CLI version number.

### `-o`, `--output` \[_path_]

```sh
mdast . --output
mdast . --output doc
mdast readme.md --output doc/foo.bar
```

Specify output.

*   If output is **not** given and one file is processed, the file is written
    to **stdout**(4). See `--no-stdout` to disable this behavior;

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
mdast --config-path mdastrc.json
```

Specify configuration location. This loads an **mdastrc**(5) file which cannot
be detected (either because `--no-rc` is given or because it has a different
name) in addition to other detected files.

### `-i`, `--ignore-path` &lt;_path_>

```sh
mdast --ignore-path .gitignore
```

Specify ignore location. This loads an **mdastignore**(5) file which cannot be
detected (either because `--no-ignore` is given or because it has a different
name) in addition to other detected files.

### `-s`, `--setting` &lt;_settings_>

```sh
mdast --setting "position:false"
```

Specify settings (see **mdastsetting**(7)). This must be a valid JSON object
except for a few differences. See **mdastconfig**(7) COMMAND LINE SETTINGS
for more information.

### `-u`, `--use` &lt;_plugin_>

```sh
mdast --use man
```

Specify a plug-in to use, optionally with options. See **mdastplugin**(7)
COMMAND LINE USAGE for more information.

### `-e`, `--ext` &lt;_extensions_>

```sh
mdast --ext doc
```

Specify one or more extensions to include when searching for files.
This will add the given `extensions` to the internal list, which includes
`'md'`, `'markdown'`, `'mkd'`, `'mkdn'`, `'mkdown'`, and `'ron'`.

The given `extensions` can be comma or semi-colon separated.

### `-w`, `--watch`

```sh
mdast -w .
```

Watch all files and reprocess when they change.

When watching files which would normally regenerate,
this behavior is ignored until the watch is closed.

```sh
$ mdast --no-rc readme.md -oqw
# Watching... (press CTRL+C to exit)
# Warning: mdast does not overwrite watched files until exit.
# Messages and other files are not affected.
```

The watch is stopped when `SIGINT` is received (usually done by pressing
`CTRL-C`).

### `-a`, `--ast`

```sh
mdast --ast
```

Instead of outputting document the internally used AST is exposed.

### `-q`, `--quiet`

```sh
mdast --quiet
```

Do not output non-essential text, only warnings and errors.

### `-S`, `--silent`

```sh
mdast --silent
```

Same as `-q`, `--quiet`, but also ignores warnings.

### `-f`, `--frail`

```sh
mdast --frail
```

Exit with a status code of `1` if warnings are triggered for the processed
code, instead of the default of only exiting with `1` on fatal errors.

### `--file-path` &lt;_path_>

```sh
cat readme.md | mdast --file-path readme.md > doc/out.md
```

Process the piped-in document as if it was a file at `path`.

### `--no-stdout`

```sh
mdast --no-stdout
```

Do not write a processed file to **stdout**(4).

### `--no-color`

```sh
mdast --no-color
```

Disable ANSI codes in output.

### `--no-rc`

```sh
mdast --no-rc
```

Disables configuration from **mdastrc**(5) files. This does not apply to
explicitly provided files through `-c`, `--config-path`.

### `--no-ignore`

```sh
mdast --no-ignore
```

Disables configuration from **mdastignore**(5) files. This does not apply to
explicitly provided files through `-i`, `--ignore-path`.

### `--`

```sh
mdast . --
```

If a `--` argument is found, argument parsing is stopped.

## DIAGNOSTICS

`mdast` exits 0 on success, and 1 otherwise.

## BUGS

<https://github.com/wooorm/mdast/issues>

## SEE ALSO

**mdastrc**(5), **mdastignore**(5), **mdastsetting**(7), **mdastconfig**(7),
**mdastplugin**(7)

## AUTHOR

Written by Titus Wormer <mailto:tituswormer@gmail.com>
