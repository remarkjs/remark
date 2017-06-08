/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:parse:defaults
 * @fileoverview Default options for `parse`.
 */

import blocks from './block-elements';

/* Expose. */
export default {
  position: true,
  gfm: true,
  yaml: true,
  commonmark: false,
  footnotes: false,
  pedantic: false,
  blocks,
  breaks: false
};
