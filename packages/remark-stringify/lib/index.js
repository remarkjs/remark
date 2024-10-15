/**
 * @import {Root} from 'mdast'
 * @import {Options as ToMarkdownOptions} from 'mdast-util-to-markdown'
 * @import {Processor} from 'unified'
 */

/**
 * @typedef {Omit<ToMarkdownOptions, 'extensions'>} Options
 */

import {toMarkdown} from 'mdast-util-to-markdown'

/**
 * Add support for serializing to markdown.
 *
 * @this {Processor<undefined, undefined, undefined, Root, string>}
 *   Processor instance.
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns {undefined}
 *   Nothing.
 */
export default function remarkStringify(options) {
  const self = this

  /**
   * @param {Root} tree
   * @returns {string}
   */
  self.compiler = function (tree) {
    return toMarkdown(tree, {
      ...self.data('settings'),
      ...options,
      // Note: this option is not in the readme.
      // The goal is for it to be set by plugins on `data` instead of being
      // passed by users.
      extensions: self.data('toMarkdownExtensions') || []
    })
  }
}
