/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:macro:compile
 * @fileoverview Compile the given node.
 */

/* Dependencies. */
import compact from 'mdast-util-compact';

/* Expose. */
export default compile;

/**
 * Stringify the given tree.
 *
 * @param {Node} node - Syntax tree.
 * @return {string} - Markdown document.
 */
function compile() {
  return this.visit(compact(this.tree, this.options.commonmark));
}
