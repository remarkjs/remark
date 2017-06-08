/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:locate:escape
 * @fileoverview Locate an escape.
 */

export default locate;

function locate(value, fromIndex) {
  return value.indexOf('\\', fromIndex);
}
