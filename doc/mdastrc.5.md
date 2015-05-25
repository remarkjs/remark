# mdastrc(5) -- mdast config files

## SYNOPSIS

**.mdastrc**, **package.json**

## DESCRIPTION

**mdast** gets its configuration from the command line and **mdastrc** files.

For a list of available configuration options, see **mdast**(1) or <https://github.com/wooorm/mdast/blob/master/doc/options.md>.

## FILES

All **mdastrc**(5) configuration files are in JSON.

Automatically detected files named `package.json` use the `mdastConfig`
field, whereas other files are used as a whole.

## FIELDS

### settings

```json
{
  "settings": {
    "commonmark": true,
    "bullet": "*"
  }
}
```

Settings contains an object mapping a setting to a value.
See `man 7 mdastconfig` for available settings.

### plugins

List:

```json
{
  "plugins": [
    "toc"
  ]
}
```

Options:

```json
{
  "plugins": {
    "github": {
      "repository": "foo/bar"
    }
  }
}
```

The `plugins` field contains either an array of plugins, or an object mapping
plugins to their options.

When a plugin is prefixed with `mdast-` (which is recommended), the prefix
can be omitted in the plugin list or map.

## CASCADE

Precedence is as follows:

*   Plug-ins and settings passed to **mdast**(1);

*   Files passed to **mdast**(1);

*   Files named `.mdastrc` and `mdastConfig` fields in `package.json` in the
    directory of the processed file, and in ancestral directories;

*   If no `.mdastrc` and `package.json` were detected in the directory of
    the file or its ancestral directories, a per-user config file (`~/.mdastrc`)
    is used;

If both `.mdastrc` and `package.json` exist in a directory, the file named
`.mdastrc` takes precedence in the cascade over `package.json`.

For example, for the following project:

```text
project
|-- docs
|   |-- .mdastrc
|   |-- doc.md
|
|-- .mdastrc
|-- package.json
|-- readme.md
```

Where `docs/.mdastrc` looks as follows:

```json
{
    "settings": {
        "bullet": "+"
    }
}
```

And `package.json` contains:

```json
{
    "mdastConfig": {
        "settings": {
            "bullet": "*"
        }
    }
}
```

And `.mdastrc` contains:

```json
{
    "settings": {
        "bullet": "-"
    }
}
```

Then, when stringifying `docs/doc.md`, **mdast**(1) would use `bullet: "+"`
because `docs/.mdastrc` takes precedence over `.mdastrc` and `package.json`.

When stringifying `readme.md`, **mdast**(1) would use `bullet: "-"`, because
`.mdastrc` takes precedence over `package.json`.

## BUGS

<https://github.com/wooorm/mdast/issues>

## SEE ALSO

**mdast**(1), **mdastignore**(5), **mdastconfig**(7).

## AUTHOR

Written by Titus Wormer <mailto:tituswormer@gmail.com>
