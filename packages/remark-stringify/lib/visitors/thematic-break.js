/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:visitors:thematic-break
 * @fileoverview Stringify a thematic-break.
 */

/* Dependencies. */
import repeat from 'repeat-string';

/* Expose. */
export default thematic;

/**
 * Stringify a `thematic-break`.
 *
 * The character used is configurable through `rule`: (`'_'`)
 *
 *     ___
 *
 * The number of repititions is defined through
 * `ruleRepetition`: (`6`)
 *
 *     ******
 *
 * Whether spaces delimit each character, is configured
 * through `ruleSpaces`: (`true`)
 *
 *     * * *
 *
 * @return {string} - Markdown thematic break.
 */
function thematic() {
  const options = this.options;
  const rule = repeat(options.rule, options.ruleRepetition);
  return options.ruleSpaces ? rule.split('').join(' ') : rule;
}
