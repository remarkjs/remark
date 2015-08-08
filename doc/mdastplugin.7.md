# mdastplugin(7) -- mdast plug-in usage

## SYNOPSIS

On **mdast**(1)

```bash
npm install mdast-lint
mdast --use lint example.md
```

On **mdast**(3)

```javascript
var mdast = require('mdast');
var lint = require('mdast-lint');

mdast.use(lint).process('Alpha **Bravo** Charlie');
```

## DESCRIPTION

This manual contains information on how **mdast**(3) plugins can be used. To
create plugins, see **mdastplugin**(3).

**mdast** plugins lie at the core of **mdast**’s vision. As they operate on
the same syntax tree, there is no start-up time penalty when using more than
one plug-in—something which traditional tools, which need to re-compile
to markdown to connect together, can be immense on large documents.

## USING PLUGINS

### PROGRAMMATIC USAGE

To use plugins in **mdast**(3), the JavaScript API, pass a plugin to
`mdast.use(plugin, options)`.

See **mdast**(3)’s USE section for more information.

### COMMAND LINE USAGE

To use plugins from the CLI, use the `--use` key (short: `-u`), which can be
passed a single npm plugin, or a path to any CommonJS JavaScript file which
exposes a plugin.
When referencing an npm plugin, and the plugin’s name is prefixed by `mdast-`,
this prefix can be omitted.

To pass options, follow the plugin’s location by an equals sign (`=`), which
is then followed by settings. For example, `--use toc=heading:contents`.

Each setting is delimited by a comma or a semi-colon, and each key is separated
with a colon from its value.

See **mdast**(1)’s `-u`, `--use` option for more information.

### .mdastrc

`.mdastrc` and `package.json` files can declare which plugins should be
used by including either a list of plugins or a map of plugin–options pairs
on a `plugins` field in the exposed object.
When referencing an npm plugin, and the plugin’s name is prefixed by
`mdast-`, this prefix can be omitted.

For example, the following `.mdastrc` file will use
[**mdast-lint**](https://www.npmjs.com/package/mdast-lint):

```json
{
  "plugins": [
    "lint"
  ]
}
```

The following `.mdastrc` file does the same, but additionally provides options
to the plugin:

```json
{
  "plugins": {
    "lint": {
      "maximum-line-length": 70
    }
  }
}
```

See **mdastrc**(5) for more information.

## BUGS

<https://github.com/wooorm/mdast/issues>

## SEE ALSO

**mdast**(1), **mdast**(3), **mdastplugin**(7), **mdastnode**(7).

## AUTHOR

Written by Titus Wormer <mailto:tituswormer@gmail.com>
