/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:util:enter-link-reference
 * @fileoverview Enter a reference.
 */

/* Dependencies. */
import returner from './returner';

/* Expose. */
export default enter;

/**
 * Shortcut and collapsed link references need no escaping
 * and encoding during the processing of child nodes (it
 * must be implied from identifier).
 *
 * This toggler turns encoding and escaping off for shortcut
 * and collapsed references.
 *
 * Implies `enterLink`.
 *
 * @param {Compiler} compiler - Compiler instance.
 * @param {LinkReference} node - LinkReference node.
 * @return {Function} - Exit state.
 */
function enter(compiler, node) {
  const encode = compiler.encode;
  const escape = compiler.escape;
  const exit = compiler.enterLink();

  if (
    node.referenceType !== 'shortcut' &&
    node.referenceType !== 'collapsed'
  ) {
    return exit;
  }

  compiler.escape = returner;
  compiler.encode = returner;

  return function () {
    compiler.encode = encode;
    compiler.escape = escape;
    exit();
  };
}
