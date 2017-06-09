/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:locate:code-inline
 * @fileoverview Locate inline code.
 */

export default locate;

function locate(value, fromIndex) {
  return value.indexOf('`', fromIndex);
}
