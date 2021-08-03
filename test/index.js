import test from 'tape'
import {removePosition} from 'unist-util-remove-position'
import {assert} from 'mdast-util-assert'
import {remark} from '../packages/remark/index.js'
import {fixtures} from './fixtures/index.js'

test('fixtures', (t) => {
  let index = -1

  next()

  // Check the next fixture.
  function next() {
    const fixture = fixtures[++index]

    if (!fixture) {
      t.end()
      return
    }

    setImmediate(next) // Queue next.

    t.test(fixture.name, (t) => {
      const actualTree = remark().parse(fixture.input)

      assert(actualTree)

      t.deepLooseEqual(
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
        removePosition(actualTree, true)
        removePosition(reparsedTree, true)

        t.deepEqual(
          actualTree,
          reparsedTree,
          'should stringify `' + fixture.name + '`'
        )
      }

      if (fixture.output === true) {
        t.equal(
          fixture.input,
          actualOutput,
          'should stringify `' + fixture.name + '` exact'
        )
      }

      t.end()
    })
  }
})
