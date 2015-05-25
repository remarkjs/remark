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
    files are overwritten;

*   `-c`, `--config-path` _path_: Specify configuration location;

*   `-i`, `--ignore-path` _path_: Specify ignore location;

*   `-s`, `--setting` _settings_: Specify settings;

*   `-u`, `--use` _plugin_: Use a transform plugin, optionally with options;

*   `-e`, `--ext` _extensions_: Specify file extensions to look for;

*   `-a`, `--ast`: Output AST information;

*   `-q`, `--quiet`: Output only warnings and errors;

*   `-S`, `--silent`: Output only errors;

*   `--no-color`: disable color in output;

*   `--no-rc`: Disable configuration from _.mdastrc_;

*   `--no-ignore`: Disable ignoring from _.mdastignore_.

A `--` argument tells the cli parser to stop reading flags.

## DIAGNOSTICS

`mdast` exits 0 on success, and 1 otherwise.

## BUGS

<https://github.com/wooorm/mdast/issues>

## SEE ALSO

**mdastrc**(5), **mdastignore**(5), **mdastconfig**(7), **mdast**(3).

## AUTHOR

Written by Titus Wormer <mailto:tituswormer@gmail.com>
