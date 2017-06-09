/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:locate:tag
 * @fileoverview Locate a tag.
 */



export default locate;

function locate(value, fromIndex) {
  return value.indexOf('<', fromIndex);
}
