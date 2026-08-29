/**
 * @import {Break, Parents, Root} from 'mdast'
 * @import {Info, Options as ToMarkdownOptions, State} from 'mdast-util-to-markdown'
 * @import {Processor} from 'unified'
 */

/**
 * @typedef {Omit<ToMarkdownOptions, 'extensions'>} Options
 */

import {defaultHandlers, toMarkdown} from 'mdast-util-to-markdown'

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
      extensions: [
        {handlers: {break: hardBreak}},
        ...(self.data('toMarkdownExtensions') || [])
      ]
    })
  }
}

/**
 * Serialize a `break`.
 *
 * CommonMark cannot represent a break at the end of phrasing, so trailing
 * breaks are omitted instead of emitting a `\` that would parse as text.
 *
 * @param {Break} node
 *   Break to serialize.
 * @param {Parents | undefined} parent
 *   Parent of `node`.
 * @param {State} state
 *   Info passed around.
 * @param {Info} info
 *   Info on the surrounding of the node.
 * @returns {string}
 *   Serialized markdown.
 */
function hardBreak(node, parent, state, info) {
  const siblings = /** @type {Array<{type: string}>} */ (
    /** @type {Parents} */ (parent).children
  )
  let index = siblings.indexOf(node)

  while (++index < siblings.length) {
    if (siblings[index].type !== 'break') {
      return defaultHandlers.break(node, parent, state, info)
    }
  }

  return ''
}
