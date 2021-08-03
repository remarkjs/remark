import {fromMarkdown} from 'mdast-util-from-markdown'

export default function remarkParse(options) {
  this.Parser = (doc) => {
    return fromMarkdown(
      doc,
      Object.assign({}, this.data('settings'), options, {
        // Note: these options are not in the readme.
        // The goal is for them to be set by plugins on `data` instead of being
        // passed by users.
        extensions: this.data('micromarkExtensions') || [],
        mdastExtensions: this.data('fromMarkdownExtensions') || []
      })
    )
  }
}
