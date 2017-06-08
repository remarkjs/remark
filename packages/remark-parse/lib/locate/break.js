/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:locate:break
 * @fileoverview Locate a break.
 */

export default locate;

function locate(value, fromIndex) {
  let index = value.indexOf('\n', fromIndex);

  while (index > fromIndex) {
    if (value.charAt(index - 1) !== ' ') {
      break;
    }

    index--;
  }

  return index;
}
