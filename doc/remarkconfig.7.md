# remarkconfig(7) -- remark configuration

## SYNOPSIS

**remark**(1), **remark**(3), **remarkrc**(5)

## DESCRIPTION

**remark** is configured from four sources:

*   **remark**(3) accepts configuration as a parameter to its `parse()`,
    `run()`, and `stringify()` methods;

*   **remark**(1) accepts configuration as command line flags through
    `-s`, `--setting` _settings_;

*   **remark**(1) additionally accepts configuration through a `settings`
    key in **remarkrc**(5) configuration files;

*   Plug-ins can configure **remark**. For example, `remark-yaml-config`
    allows configuration to be set through YAML front-matter.

For a list of available configuration settings, see **remarksetting**(7).

## SETTINGS FOR `PROCESS`, `PARSE`, AND `STRINGIFY`

To configure the programmatic interface of **remark**, pass an object as a
second parameter to `process()`, `parse()`, and `stringify()`.

## COMMAND LINE SETTINGS

To configure the CLI of **remark**, pass a string to the `--setting`
(or `-s`) flag.

Command line settings are just JSON, with two exceptions:

*   Keys do not need to be escaped, thus, both `"foo": "bar"` and
    `foo: "bar"` are considered equal;

*   The surrounding braces must not be used: `"foo": 1`, is first
    wrapped as `{"foo": 1}`, and then passed to `JSON.parse`.

Valid examples are:

```bash
remark --setting "foo:true" --setting "\"bar\": \"baz\""
remark --setting "foo-bar:-2"
remark --setting "foo: false, bar-baz: [\"qux\", 1]"
```

Command Line Settings can be specified both in camel- and dash-case:
`foo-bar: true` and `fooBar: true` are treated equally.

## CONFIGURATION FILES

Specify directory specific settings with `.remarkrc`, `.remarkrc.js`,
and `package.json` files.  See **remarkrc**(5) for more information.

## BUGS

<https://github.com/wooorm/remark/issues>

## SEE ALSO

**remark**(1), **remark**(3), **remarkignore**(5), **remarkrc**(5),
**remarksetting**(7)
