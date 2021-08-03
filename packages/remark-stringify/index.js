import {toMarkdown} from 'mdast-util-to-markdown'

export default function remarkStringify(options) {
  this.Compiler = (tree) => {
    return toMarkdown(
      tree,
      Object.assign({}, this.data('settings'), options, {
        // Note: this option is not in the readme.
        // The goal is for it to be set by plugins on `data` instead of being
        // passed by users.
        extensions: this.data('toMarkdownExtensions') || []
      })
    )
  }
}
