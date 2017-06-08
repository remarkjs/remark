/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:script
 * @fileoverview Regenerate all fixtures according to their
 *   configuration (found in each filename), useful when
 *   the parser is modified to output different syntax trees.
 */

/* Dependencies. */
import fs from 'fs';
import path from 'path';
import remark from '../packages/remark';
import fixtures from '../test/fixtures';

/* Regenerate. */
fixtures.forEach(fixture => {
  const input = fixture.input;
  const name = fixture.name;
  const mapping = fixture.mapping;

  Object.keys(mapping).forEach(key => {
    let filename = name + (key ? '.' + key : key) + '.json';
    let result;

    try {
      result = remark()
        .data('settings', fixture.possibilities[key])
        .parse(input);
    } catch (err) {
      console.log('Could not regenerate `' + filename + '`');
      throw err;
    }

    result = JSON.stringify(result, null, 2) + '\n';

    filename = filename.replace(/\*/g, '-asterisk-');

    fs.writeFileSync(
      path.join('test', 'fixtures', 'tree', filename),
      result
    );
  });
});
