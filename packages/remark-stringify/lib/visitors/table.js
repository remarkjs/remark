/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:stringify:visitors:table
 * @fileoverview Stringify a table.
 */

/* Dependencies. */
import markdownTable from 'markdown-table';

/* Expose. */
export default table;

/**
 * Stringify table.
 *
 * Creates a fenced table by default, but not in
 * `looseTable: true` mode:
 *
 *     Foo | Bar
 *     :-: | ---
 *     Baz | Qux
 *
 * NOTE: Be careful with `looseTable: true` mode, as a
 * loose table inside an indented code block on GitHub
 * renders as an actual table!
 *
 * Creates a spaced table by default, but not in
 * `spacedTable: false`:
 *
 *     |Foo|Bar|
 *     |:-:|---|
 *     |Baz|Qux|
 *
 * @param {Object} node - `table` node.
 * @return {string} - Markdown table.
 */
function table(node) {
  const self = this;
  const loose = self.options.looseTable;
  const spaced = self.options.spacedTable;
  const pad = self.options.paddedTable;
  const rows = node.children;
  let index = rows.length;
  const exit = self.enterTable();
  const result = [];
  let start;
  let end;

  while (index--) {
    result[index] = self.all(rows[index]);
  }

  exit();

  if (loose) {
    start = '';
    end = '';
  } else if (spaced) {
    start = '| ';
    end = ' |';
  } else {
    start = '|';
    end = '|';
  }

  return markdownTable(result, {
    align: node.align,
    pad,
    start,
    end,
    delimiter: spaced ? ' | ' : '|'
  });
}
