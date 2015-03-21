# mdastrc(5) -- mdast config files

## DESCRIPTION

**mdast** gets its configuration from the command line and **mdastrc** files.

For a list of available configuration options, see **mdast**(1) or
[<https://github.com/wooorm/mdast/blob/master/doc/Options.md](<https://github.com/wooorm/mdast/blob/master/doc/Options.md)>.

## FILES

All **mdastrc**(5) configuration files are in JSON.

Automatically detected files named `package.json` use the
`mdastConfig` field, whereas other files are used as a
whole.

## CASCADE

Precedence is as follows:

*   Plug-ins and settings passed to **mdast**(1);
*   File passed to **mdast**(1);
*   Files named `.mdastrc` and `mdastConfig` fields in
    `package.json` in the directory of the processed file,
    and in ancestral directories;
*   If no `.mdastrc` and `package.json` were detected in
    the directory of the file or its ancestral directories,
    a per-user config file (`~/.mdastrc`) is used;

If both `.mdastrc` and `package.json` exist in a directory,
the file named `.mdastrc` takes precedence in the cascade
over `package.json`.

For example, for the following project:

```text
project
|-- docs
|   |-- .mdastrc
|   |-- Doc.md
|
|-- .mdastrc
|-- package.json
|-- Readme.md
```

Where `doc/.mdastrc` looks as follows:

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

Then, when stringifying `docs/Doc.md`, **mdast(1)** would use
`bullet: "+"` because `doc/.mdastrc` takes precedence over
`.mdastrc` and `package.json`.

When stringifying `Readme.md`, **mdast(1)** would use
`bullet: "-"`, because `.mdastrc` takes precedence over
`package.json`.

## BUGS

<<https://github.com/wooorm/mdast/issues>>

## SEE ALSO

mdast(1)

## AUTHOR

Written by Titus Wormer <<tituswormer@gmail.com>>
