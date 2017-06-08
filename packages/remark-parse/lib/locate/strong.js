/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:locate:strong
 * @fileoverview Locate bold / strong / importance.
 */

export default locate;

function locate(value, fromIndex) {
  const asterisk = value.indexOf('**', fromIndex);
  const underscore = value.indexOf('__', fromIndex);

  if (underscore === -1) {
    return asterisk;
  }

  if (asterisk === -1) {
    return underscore;
  }

  return underscore < asterisk ? underscore : asterisk;
}
