import remark = require('remark')

interface PluginOptions {
  example: boolean
}

const plugin = (options?: PluginOptions) => {}

remark.parse('# Hello world!')
remark().use(plugin)
remark().use(plugin, {example: true})
remark().use({settings: {bullet: '+'}})
// $ExpectError
remark().use({settings: {doesNotExist: true}})
// $ExpectError
remark().use(plugin, {doesNotExist: 'true'})

const badParseOptionsInterface: remark.RemarkOptions = {
  // $ExpectError
  gfm: 'true'
}
