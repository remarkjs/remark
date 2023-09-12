import assert from 'node:assert/strict'
import test from 'node:test'
import {removePosition} from 'unist-util-remove-position'
import {assert as mdastAssert} from 'mdast-util-assert'
import {remark} from '../packages/remark/index.js'
import {fixtures} from './fixtures/index.js'

test('fixtures', async (t) => {
  let index = -1

  while (++index < fixtures.length) {
    const fixture = fixtures[index]

    // eslint-disable-next-line no-await-in-loop
    await t.test(fixture.name, () => {
      const actualTree = remark().parse(fixture.input)

      mdastAssert(actualTree)

      assert.deepEqual(
        actualTree,
        fixture.tree,
        'should parse `' + fixture.name + '` correctly'
      )

      const actualOutput = remark()
        .data('settings', fixture.stringify)
        .stringify(actualTree)

      if (fixture.output !== false) {
        const reparsedTree = remark().parse(actualOutput)

        assert(reparsedTree)
        removePosition(actualTree, {force: true})
        removePosition(reparsedTree, {force: true})

        assert.deepEqual(
          actualTree,
          reparsedTree,
          'should stringify `' + fixture.name + '`'
        )
      }

      if (fixture.output === true) {
        assert.equal(
          fixture.input,
          actualOutput,
          'should stringify `' + fixture.name + '` exact'
        )
      }
    })
  }
})
