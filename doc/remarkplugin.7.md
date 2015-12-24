# remarkplugin(7) -- remark plug-in usage

## SYNOPSIS

On **remark**(1)

```bash
npm install remark-lint
remark --use lint example.md
```

On **remark**(3)

```javascript
var remark = require('remark');
var lint = require('remark-lint');

remark.use(lint).process('Alpha **Bravo** Charlie');
```

## DESCRIPTION

This manual contains information on how **remark**(3) plugins can be used. To
create plugins, see **remarkplugin**(3).

**remark** plugins lie at the core of **remark**’s vision. As they operate on
the same syntax tree, there is no start-up time penalty when using more than
one plug-in—something which traditional tools, which need to re-compile
to markdown to connect together, can be immense on large documents.

## USING PLUGINS

### PROGRAMMATIC USAGE

To use plugins in **remark**(3), the JavaScript API, pass a plugin to
`remark.use(plugin, options)`.

See **remark**(3)’s USE section for more information.

### COMMAND LINE USAGE

To use plugins from the CLI, use the `--use` key (short: `-u`), which can be
passed a single npm plugin, or a path to any CommonJS JavaScript file which
exposes a plugin.
When referencing an npm plugin, and the plugin’s name is prefixed by `remark-`,
this prefix can be omitted.

To pass options, follow the plugin’s location by an equals sign (`=`), which
is then followed by settings. For example, `--use toc=heading:contents`.

Each setting is delimited by a comma or a semi-colon, and each key is separated
with a colon from its value.

See **remark**(1)’s `-u`, `--use` option for more information.

### .remarkrc

`.remarkrc` and `package.json` files can declare which plugins should be
used by including either a list of plugins or a map of plugin–options pairs
on a `plugins` field in the exposed object.
When referencing an npm plugin, and the plugin’s name is prefixed by
`remark-`, this prefix can be omitted.

For example, the following `.remarkrc` file will use
[**remark-lint**](https://www.npmjs.com/package/remark-lint):

```json
{
  "plugins": [
    "lint"
  ]
}
```

The following `.remarkrc` file does the same, but additionally provides options
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

See **remarkrc**(5) for more information.

## BUGS

<https://github.com/wooorm/remark/issues>

## SEE ALSO

**remark**(1), **remark**(3), **remarkplugin**(7)

## Notes

See also <https://github.com/wooorm/mdast>.

## AUTHOR

Written by Titus Wormer <mailto:tituswormer@gmail.com>
