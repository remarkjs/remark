# mdast(1) -- Markdown processor

## SYNOPSIS

`mdast` \[`options`\] _file|dir_ _..._

## DESCRIPTION

**mdast** is speedy Markdown parser (and stringifier) for multipurpose
analysis in JavaScript.  Node.js and browser.  Lots of tests.  100%
coverage.

Logs verbose debugging information when `$DEBUG` is set to `"mdast"`.

Options are as follows:

*   `-h`, `--help`: Output usage information;

*   `-V`, `--version`: Output version number;

*   `-o`, `--output` _path_: Specify output.  When _path_ is omitted, input
    files are overwritten.  When _path_ is a directory, files are written to
    that directory.  When the parent directory of _path_ exists, and multiple
    files are given, an error is thrown, if one file is given it is written
    to _path_.

*   `-c`, `--config-path` _path_: specify configuration location;

*   `-i`, `--ignore-path` _path_: specify ignore location;

*   `-s`, `--setting` _settings_: specify settings;

*   `-u`, `--use` _plugin_: use a plugin, optionally with options;

*   `-e`, `--ext` _extensions_: specify file extensions to look for;

*   `-a`, `--ast`: output AST information;

*   `-q`, `--quiet`: output only warnings and errors;

*   `-S`, `--silent`: output only errors;

*   `-f`, `--frail`: exit with 1 on warnings;

*   `--file-path <path>`: specify file path to process as

*   `--no-stdout`: disable writing to stdout;

*   `--no-color`: disable color in output;

*   `--no-rc`: disable configuration from _.mdastrc_;

*   `--no-ignore`: disable ignoring from _.mdastignore_.

A `--` argument tells the cli parser to stop reading flags.

## DIAGNOSTICS

`mdast` exits 0 on success, and 1 otherwise.

## BUGS

<https://github.com/wooorm/mdast/issues>

## SEE ALSO

**mdastrc**(5), **mdastignore**(5), **mdastconfig**(7), **mdast**(3).

## AUTHOR

Written by Titus Wormer <mailto:tituswormer@gmail.com>
