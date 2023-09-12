/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast-util-from-markdown').Options} FromMarkdownOptions
 * @typedef {import('unified').Parser<Root>} Parser
 * @typedef {import('unified').Processor<Root>} Processor
 */

/**
 * @typedef {Omit<FromMarkdownOptions, 'extensions' | 'fromMarkdownExtensions'>} Options
 */

import {fromMarkdown} from 'mdast-util-from-markdown'

/**
 * Aadd support for parsing from markdown.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns {undefined}
 *   Nothing.
 */
export default function remarkParse(options) {
  /** @type {Processor} */
  // @ts-expect-error: TS in JSDoc generates wrong types if `this` is typed regularly.
  const self = this

  self.parser = parser

  /**
   * @type {Parser}
   */
  function parser(doc) {
    // To do: remove cast when typed.
    // Assume options.
    const settings = /** @type {Options} */ (self.data('settings'))

    /** @type {FromMarkdownOptions} */
    const resolvedOptions = {
      ...settings,
      ...options,
      // Note: these options are not in the readme.
      // The goal is for them to be set by plugins on `data` instead of being
      // passed by users.
      // @ts-expect-error: to do: type.
      extensions: self.data('micromarkExtensions') || [],
      // @ts-expect-error: to do: type.
      mdastExtensions: self.data('fromMarkdownExtensions') || []
    }

    return fromMarkdown(doc, resolvedOptions)
  }
}
