# mdastconfig(7) -- mdast configuration

## SYNOPSIS

**mdast**(1), **mdast**(3), **mdastrc**(5)

## DESCRIPTION

**mdast** is configured from multiple sources:

*   **mdast**(3) accepts configuration as a parameter to its `parse()`,
    `run()`, and `stringify()` methods;

*   **mdast**(1) accepts configuration as command line flags through
    `-s`, `--setting` _settings_;

*   **mdast**(1) additionally accepts configuration through a `settings`
    key in **mdastrc**(5) configuration files;

*   Plug-ins can configure mdast, for example, **mdast-yaml-config** allows
    per-file configuration to be set through YAML front-matter.

For a list of available configuration options, see the SETTINGS section
below or <https://github.com/wooorm/mdast/blob/master/doc/options.md>.

### SETTINGS FOR `PROCESS`, `PARSE()`, AND `STRINGIFY()`

To configure the programatic interface of **mdast**, pass an object as a
second parameter to `process()`, `parse()`, and `stringify()`.

### COMMAND LINE SETTINGS

To configure the shell interface of **mdast**, pass a string to the
`--setting` (or `-s`) flag.

Command line settings are just JSON, with two exceptions:

*   Keys do not need to be escaped, thus, both `"foo": "bar"` and
    `foo: "bar"` are considered equal;

*   The surrounding braces must not be used: `"foo": 1`, is first
    wrapped as `{"foo": 1}`, and then passed to `JSON.parse`.

Valid examples are:

```bash
mdast --setting "foo:true" --setting "\"bar\": \"baz\""
mdast --setting "foo-bar:-2"
mdast --setting "foo: false, bar-baz: [\"qux\", 1]"
```

Command Line Settings can be specified both in camel- and dash-case:
`foo-bar: true` and `fooBar: true` are treated equally.

### CONFIGURATION FILES

Specify directory specific settings with `.mdastrc` and `package.json`
files.  See **mdastrc**(5) for more information.

## SETTINGS

### PARSE

See <https://github.com/wooorm/mdast/blob/master/doc/options.md#parse>
for a description of these settings.

*   `position` (boolean, default: true);
*   `gfm` (boolean, default: true);
*   `yaml` (boolean, default: true);
*   `pedantic` (boolean, default: false);
*   `commonmark` (boolean, default: false);
*   `breaks` (boolean, default: false);
*   `footnotes` (boolean, default: false).

### STRINGIFY

See <https://github.com/wooorm/mdast/blob/master/doc/options.md#stringify>
for a description of these settings.

*   `entities` (`false`, `true`, or `"numbers"`, default: `false`);
*   `setext` (boolean, default: `false`);
*   `closeAtx` (boolean, default: `false`);
*   `looseTable` (boolean, default: `false`);
*   `spacedTable` (boolean, default: `true`);
*   `incrementListMarker` (boolean, default: `true`);
*   `fences` (boolean, default: `false`);
*   `fence` (`"~"` or ``"`"``, default: ``"`"``);
*   `bullet` (`"-"`, `"*"`, or `"+"`, default: `"-"`);
*   `rule` (`"-"`, `"\*"`, or `"_"`, default: `"*"`);
*   `ruleRepetition` (number, default: `3`);
*   `ruleSpaces` (boolean, default: `false`);
*   `strong` (`"_"` or `"\*"`, default: `"*"`);
*   `emphasis` (`"\_"` or `"*"`, default: `"_"`).

## BUGS

<https://github.com/wooorm/mdast/issues>

## SEE ALSO

**mdast**(1), **mdast**(3), **mdastrc**(5), **mdastignore**(5).

## AUTHOR

Written by Titus Wormer <mailto:tituswormer@gmail.com>
