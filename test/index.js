import {test} from 'node:test'
import assert from 'node:assert/strict'
import {removePosition} from 'unist-util-remove-position'
import {assert as assertMdast} from 'mdast-util-assert'
import {remark} from '../packages/remark/index.js'
import {fixtures} from './fixtures/index.js'

test('fixtures', (t) => {
  let index = -1

  next()

  // Check the next fixture.
  function next() {
    const fixture = fixtures[++index]

    if (!fixture) {
      return
    }

    setImmediate(next) // Queue next.

    t.test(fixture.name, () => {
      const actualTree = remark().parse(fixture.input)

      assertMdast(actualTree)

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

        assertMdast(reparsedTree)
        removePosition(actualTree, true)
        removePosition(reparsedTree, true)

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
