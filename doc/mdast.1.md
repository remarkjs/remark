# mdast(1) -- Markdown parser and stringifier

## SYNOPSIS

`mdast` [`-a`, `--ast`] [`-q`, `--quiet`] [`-o`, `--output` [_path_]] [`-s`, `--setting` _settings_] [`-u`, `--use` _plugins_] [`-c`, `--config-path` _path_] [`-i`, `--ignore-path` _path_] [`-e`, `--ext` [_extensions_]] [`--no-color`] [`--no-rc`] [`--no-ignore`] _file|dir_ _..._

## DESCRIPTION

**mdast** is speedy Markdown parser (and stringifier) for multipurpose analysis in JavaScript.  Node.js and browser.  Lots of tests.  100% coverage.

Logs verbose debugging information when `$DEBUG` is set to `"mdast"`.

Options are as follows:

*   `-h`, `--help`: Output usage information;
*   `-V`, `--version`: Output version number;
*   `-o`, `--output` _path_: Specify output location.  When _path_ is omitted, input files are overwritten;
*   `-c`, `--config-path` _path_: Specify configuration location;
*   `-i`, `--ignore-path` _path_: Specify ignore location;
*   `-s`, `--setting` _settings_: Specify settings;
*   `-u`, `--use` _plugins_: Use transform plugin(s);
*   `-e`, `--ext` _extensions_: Specify file extensions to look for;
*   `-a`, `--ast`: Output AST information;
*   `-q`, `--quiet`: Output less messages;
*   `--no-color`: disable color in output;
*   `--no-rc`: Disable configuration from _.mdastrc_;
*   `--no-ignore`: Disable ignoring from _.mdastignore_.

A `--` argument tells the cli parser to stop reading flags.

## DIAGNOSTICS

`mdast` exits 0 on success, and 1 otherwise.

## BUGS

[https://github.com/wooorm/mdast/issues](https://github.com/wooorm/mdast/issues)

## SEE ALSO

**mdastrc**(5), **mdastignore**(5), **mdastconfig**(7).

## AUTHOR

Written by Titus Wormer [tituswormer@gmail.com](tituswormer@gmail.com)
