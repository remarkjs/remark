# mdastconfig(7) -- mdast configuration

## SYNOPSIS

**mdast**(1), **mdast**(3), **mdastrc**(5)

## DESCRIPTION

**mdast** is configured from multiple sources:

*   **mdast**(3) accepts configuration as a parameter to its `parse()`, `run()`, and `stringify()` methods;
*   **mdast**(1) accepts configuration as command line flags through `-s`, `--setting` _settings_;
*   **mdast**(1) additionally accepts configuration through a `settings` key in **mdastrc**(5) configuration files;
*   Plug-ins can configure mdast, for example, **mdast-yaml-config** allows per-file configuration to be set through YAML front-matter.

For a list of available configuration options, see the SETTINGS section below or [https://github.com/wooorm/mdast/blob/master/doc/Options.md](https://github.com/wooorm/mdast/blob/master/doc/Options.md).

### SETTINGS FOR `PARSE()`, `RUN()`, AND `STRINGIFY()`

To configure the programatic interface of **mdast**, pass an object as a second parameter to `parse()`, `run()`, and `stringify()`.

### COMMAND LINE SETTINGS

To configure the shell interface of **mdast**, pass a string to the `--setting` (or `-s`) flag.

Command Line Settings take the form of a comma (`,`) and semi-colon (`;`) delimited list of attributes, where each attribute consists of a key and an optional value: if both, then separated by a colon (`:`).

The below are all valid examples:

```bash
$ mdast --setting "foo" --setting "baz:qux"
$ mdast --setting "foo,baz:qux"
$ mdast --setting "foo;baz:qux"
```

An attribute without value will be treated as a value of `true`.

Command Line Settings can be specified both in camel- and dash-case: `foo-bar` and `fooBar` are treated equally.

### CONFIGURATION FILES

Specify directory specific settings with `.mdastrc` and `package.json` files.  See **mdastrc**(5) for more information.

## SETTINGS

### PARSE

See [https://github.com/wooorm/mdast#mdastparsevalue-options](https://github.com/wooorm/mdast#mdastparsevalue-options) for a description of these settings.

*   `gfm` (boolean, default: true);
*   `yaml` (boolean, default: true);
*   `pedantic` (boolean, default: false);
*   `commonmark` (boolean, default: false);
*   `breaks` (boolean, default: false);
*   `footnotes` (boolean, default: false).

### STRINGIFY

See [https://github.com/wooorm/mdast#mdaststringifyast-options](https://github.com/wooorm/mdast#mdaststringifyast-options) for a description of these settings.

*   `setext` (boolean, default: false);
*   `closeAtx` (boolean, default: false);
*   `looseTable` (boolean, default: false);
*   `spacedTable` (boolean, default: true);
*   `referenceLinks` (boolean, default: false);
*   `fences` (boolean, default: false);
*   `bullet` ("-", "*", or "+", default: "-");
*   `rule` ("-", "\*", or "_", default: "*");
*   `ruleRepetition` (number, default: 3);
*   `ruleSpaces` (boolean, default: false);
*   `strong` ("_", or "\*", default: "*");
*   `emphasis` ("\_", or "*", default: "_").

## BUGS

[https://github.com/wooorm/mdast/issues](https://github.com/wooorm/mdast/issues)

## SEE ALSO

**mdast**(1), **mdastrc**(5), **mdastignore**(5).

## AUTHOR

Written by Titus Wormer [tituswormer@gmail.com](tituswormer@gmail.com)
