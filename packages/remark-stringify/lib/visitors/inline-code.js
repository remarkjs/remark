/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:visitors:inline-code
 * @fileoverview Stringify inline code.
 */

/* Dependencies. */
import streak from 'longest-streak';
import repeat from 'repeat-string';

/* Expose. */
export default inlineCode;

/**
 * Stringify inline code.
 *
 * Knows about internal ticks (`\``), and ensures one more
 * tick is used to enclose the inline code:
 *
 *     ```foo ``bar`` baz```
 *
 * Even knows about inital and final ticks:
 *
 *     `` `foo ``
 *     `` foo` ``
 *
 * @param {Object} node - `inlineCode` node.
 * @return {string} - Markdown inline code.
 */
function inlineCode(node) {
  const value = node.value;
  const ticks = repeat('`', streak(value, '`') + 1);
  let start = ticks;
  let end = ticks;

  if (value.charAt(0) === '`') {
    start += ' ';
  }

  if (value.charAt(value.length - 1) === '`') {
    end = ' ' + end;
  }

  return start + value + end;
}
