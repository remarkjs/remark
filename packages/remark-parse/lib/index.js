/**
 * @import {Root} from 'mdast'
 * @import {Options as FromMarkdownOptions} from 'mdast-util-from-markdown'
 * @import {Processor} from 'unified'
 */

/**
 * @typedef {Omit<FromMarkdownOptions, 'extensions' | 'mdastExtensions'>} Options
 */

import {fromMarkdown} from 'mdast-util-from-markdown'

/**
 * Aadd support for parsing from markdown.
 *
 * @this {Processor<Root>}
 *   Processor instance.
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns {undefined}
 *   Nothing.
 */
export default function remarkParse(options) {
  const self = this

  /**
   * @param {string} document
   * @returns {Root}
   */
  self.parser = function (document) {
    return fromMarkdown(document, {
      ...self.data('settings'),
      ...options,
      // Note: these options are not in the readme.
      // The goal is for them to be set by plugins on `data` instead of being
      // passed by users.
      extensions: self.data('micromarkExtensions') || [],
      mdastExtensions: self.data('fromMarkdownExtensions') || []
    })
  }
}
