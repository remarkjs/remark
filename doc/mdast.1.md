# mdast(1) -- Markdown parser and stringifier

## SYNOPSIS

  `mdast` [`-a`, `--ast`] [`-o`, `--output` _path_] [`-s`, `--setting` _settings_] [`-u`, `--use` _plugins_] file
  `mdast` --settings

## DESCRIPTION

**mdast** is speedy Markdown parser (and stringifier) for multipurpose analysis in JavaScript.  Node.js and browser.  Lots of tests.  100% coverage.

Logs verbose debugging information when `$DEBUG` is set to `"mdast"`.

Options are as follows:

* `-h`, `--help`: Output usage information;
* `-V`, `--version`: Output version number;
* `-o`, `--output` _path_: Specify output location;
* `-s`, `--setting` _settings_: Specify settings;
* `-u`, `--use` _plugins_: Use transform plugin(s);
* `-a`, `--ast`: Output AST information;
* `--settings`: Output available settings.

## DIAGNOSTICS

`mdast` exits 0 on success, and 1 otherwise.

## BUGS

<<https://github.com/wooorm/mdast/issues>>

## AUTHOR

Written by Titus Wormer <<tituswormer@gmail.com>>
