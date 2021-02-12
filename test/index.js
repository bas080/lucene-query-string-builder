'use strict'

const expect = require('chai').expect
const l = require('../index.js')

describe('builder', () => {
  it('generates a string', () => {
    const helloWorldQuery = l.builder((data) => {
      return l.field(data.hello, l.term(data.world))
    })

    expect(helloWorldQuery({
      hello: 'hello',
      world: 'world'
    })).to.equal('hello: "world"')
  })
})

describe('range', () => {
  it('includes both the left and right equal cases', () => {
    expect(l.range('a', 'b', true, true)).to.equal('[ a TO b ]')
  })

  it('includes the left equal case', () => {
    expect(l.range('a', 'b', true)).to.equal('[ a TO b }')
  })

  it('includes the left equal case', () => {
    expect(l.range('a', 'b', false, true)).to.equal('{ a TO b ]')
  })

  it('excludes the equal cases by default', () => {
    expect(l.range('a', 'b')).to.equal('{ a TO b }')
  })
})

describe('group', () => {
  it('group', () => {
    expect(l.group.apply(null, ['red', 'white', 'blue'].map(l.term)))
      .to.equal('( "red" "white" "blue" )')
  })
})

describe('term', () => {
  it('creates a term query', function () {
    expect(l.terms('hello world')).to.equal('"hello world"')
  })

  it('escapes query syntax characters', function () {
    expect(l.terms('()')).to.equal('"\\(\\)"')
  })
})

describe('fuzzy', () => {
  it('throws a RangeError when similarity is out of range', () => {
    expect(
      l.fuzzy.bind(null, l.term('lucene'), 200)
    ).to.throw(RangeError)
  })

  it('returns a valid fuzzy search when similarity is not defined', () => {
    expect(l.fuzzy('hello')).to.equal('hello~')
    expect(l.fuzzy('hello')).to.equal('hello~')
    expect(l.fuzzy('hello')).to.equal('hello~')
  })

  it('returns a valid fuzzy search when similarity param is passed', () => {
    expect(l.fuzzy('hello', 1)).to.equal('hello~1')
    expect(l.fuzzy('hello', 0)).to.equal('hello~0')
    expect(l.fuzzy('hello', 0.5)).to.equal('hello~0.5')
  })
})

describe('proximity', () => {
  it('returns a valid proximity query', () => {
    expect(l.proximity('hello', 'world', 10)).to.equal('"hello world"~10')
    // expect(l.proximity('hello', 'world', Infinity)).to.equal('"hello world"~Infinity');
  })

  it('throw when arguments are invalid', () => {
    expect(l.proximity.bind(null, 'lucene')).to.throw(TypeError)
    expect(l.proximity.bind(null, 'lucene', 'hello')).to.throw(TypeError)
    expect(l.proximity.bind(null, 'lucene', 'hello', Infinity)).to.throw(RangeError)
    expect(l.proximity.bind(null, 'lucene', 'hello', -1)).to.throw(RangeError)
    expect(l.proximity.bind(null, 'lucene', 'hello', -Infinity)).to.throw(RangeError)
  })
})

/***
 * These are combined as they use the same function to be bootstrapped
 */
describe('or/and/not', () => {
  ['or', 'and', 'not'].forEach(function (operator) {
    const uppered = operator.toUpperCase()

    it('places the operator in the middle of the other operators', () => {
      expect(l[operator](
        l.terms('hello'),
        l.terms('world')
      )).to.equal(`"hello" ${uppered} "world"`)
    })

    it('takes a variadic amount of args', () => {
      expect(l[operator](
        l.terms('hello'),
        l.terms('world'),
        l.terms('red')
      )).to.equal(`"hello" ${uppered} "world" ${uppered} "red"`)
    })
  })
})
