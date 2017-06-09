/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:locate:link
 * @fileoverview Locate a link.
 */

export default locate;

function locate(value, fromIndex) {
  const link = value.indexOf('[', fromIndex);
  const image = value.indexOf('![', fromIndex);

  if (image === -1) {
    return link;
  }

  /* Link can never be `-1` if an image is found, so we don’t need
   * to check for that :) */
  return link < image ? link : image;
}
