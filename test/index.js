'use strict'

const test = require('tape')
const l = require('../index.js')

test('builder', t => {
  const helloWorldQuery = l.builder((data) => {
    return l.field(data.hello, l.term(data.world))
  })
  t.equal(helloWorldQuery({
    hello: 'hello',
    world: 'world'
  }), 'hello: "world"')
  t.end()
})

test('range', t => {
  t.equal(l.range('a', 'b', true, true), '[ a TO b ]')
  t.equal(l.range('a', 'b', true), '[ a TO b }')
  t.equal(l.range('a', 'b', false, true), '{ a TO b ]')
  t.equal(l.range('a', 'b'), '{ a TO b }')
  t.end()
})

test('group', t => {
  t.equal(
    l.group.apply(null, ['red', 'white', 'blue'].map(l.term)),
    '( "red" "white" "blue" )')
  t.end()
})

test('term', t => {
  t.equal(l.terms('hello world'), '"hello world"')
  t.equal(l.terms('()'), '"\\(\\)"')
  t.end()
})

test('fuzzy', t => {
  t.throws(l.fuzzy.bind(null, l.term('lucene'), 200), RangeError)
  t.equal(l.fuzzy('hello'), 'hello~')
  t.equal(l.fuzzy('hello'), 'hello~')
  t.equal(l.fuzzy('hello'), 'hello~')
  t.equal(l.fuzzy('hello', 1), 'hello~1')
  t.equal(l.fuzzy('hello', 0), 'hello~0')
  t.equal(l.fuzzy('hello', 0.5), 'hello~0.5')
  t.end()
})

test('proximity', t => {
  t.equal(l.proximity('hello', 'world', 10), '"hello world"~10')

  t.throws(l.proximity.bind(null, 'lucene'), TypeError)
  t.throws(l.proximity.bind(null, 'lucene', 'hello'), TypeError)
  t.throws(l.proximity.bind(null, 'lucene', 'hello', Infinity), RangeError)
  t.throws(l.proximity.bind(null, 'lucene', 'hello', -1), RangeError)
  t.throws(l.proximity.bind(null, 'lucene', 'hello', -Infinity), RangeError)
  t.end()
})

/***
 * These are combined as they use the same function to be bootstrapped
 */
test('or/and/not', t => {
  ['or', 'and', 'not'].forEach(function (operator) {
    const uppered = operator.toUpperCase()

    t.equal(l[operator](
      l.terms('hello'),
      l.terms('world')
    ), `"hello" ${uppered} "world"`)

    t.equal(l[operator](
      l.terms('hello'),
      l.terms('world'),
      l.terms('red')
    ), `"hello" ${uppered} "world" ${uppered} "red"`)
  })
  t.end()
})
