'use strict'

const luceneEscapeQuery = require('lucene-escape-query')

/**
 * Lucene Query Builder
 *
 * Lucene query syntax docs (specs)
 * https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Terms
 */

const lucene = {}

/**
 * https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Grouping
 *
 * @param {string} query
 *
 * @returns {string}
 */
const group = surrounder('(', ')')

/**
 * Used for defining a query builder
 *
 * @param {function} fn
 * @returns {function}
 *
 * @example
 *
 * userLuceneQuery = lucene.builder((data) => {
 *   return lucene.field(
 *     lucene.term('user-name', data.user.name)
 *   );
 * });
 *
 * userLuceneQuery({user: {name: 'Dolly'}}) // => 'user-name: 'Dolly''
 */
function builder (buildFn) {
  assertFunction(buildFn, 'buildFn', 0)

  return (data) => buildFn(data)
}

/**
 * https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Terms
 *
 * @param {string} words
 *
 * @returns {string}
 *
 * @todo make sure lucene query characters are escaped with a \
 */
function terms (words) {
  assertString(words, 'words', 0)

  return `"${luceneEscapeQuery.escape(words)}"`
}

/**
 * https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Boosting%20a%20Term
 *
 * @param {string} term
 * @param {number} boost
 *
 * @returns {string}
 */
function boost (term, boost) {
  assertString(term, 'term', 0)
  assertRange(1, Infinity, boost, 'boost', 1)

  return `${term}^${boost}`
}

/**
 * https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Fields
 *
 * @param {string} field
 * @param {string} query
 *
 * @returns {string} the format is <field>: <term(s)>
 *
 * @example
 * lucene.field('prop-name', lucene.term('value')) // => 'prop-name: "value"'
 */
function field (field, query) {
  assertString(field, 'field', 0)
  assertString(query, 'query', 1)

  return `${field}: ${query}`
}

/**
 * https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Fuzzy%20Searches
 *
 * The value is between 0 and 1, with a value closer to 1 only terms with a
 * higher similarity will be matched.
 *
 * Fuzzy search can only be applied to a single term
 *
 * @param {string} term
 * @param {number} [similarity=undefined]
 *
 */
function fuzzy (term, similarity) {
  assertString(term, 'term', 0)

  if (arguments.length === 1) { return `${term}~` }

  assertRange(0, 1, similarity, 'similarity', 1)

  return `${term}~${similarity}`
}

/**
 * https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Proximity%20Searches
 *
 * Lucene supports finding words are a within a specific distance away.
 *
 * @param {string} first
 * @param {string} second
 *
 * @param {number} distance
 *
 * @returns {string}
 */
function proximity (first, second, distance) {
  assertString(first, 'first', 0)
  assertString(second, 'second', 1)
  assertRange(0, Infinity, distance, 'distance', 2)

  return `"${first} ${second}"~${distance}`
}

/**
 * https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Range%20Searches
 *
 * Range Queries allow one to match documents whose field(s) values are
 * between the lower and upper bound specified by the Range Query. Range
 * Queries can be inclusive or exclusive of the upper and lower bounds.
 *
 * @param {string}
 * @param {string}
 * @param {boolean} [includeLeft=false]
 * @param {boolean} [includeRight=false]
 *
 * @returns {string}
 */
function range (from, to, includeLeft, includeRight) {
  assertString(from, 'from', 0)
  assertString(from, 'to', 1)

  return surrounder(
    includeLeft ? '[' : '{',
    includeRight ? ']' : '}'
  )(`${from} TO ${to}`)
}

/**
 * @param {string} term
 *
 * @returns {string}
 */
function required (term) {
  assertString(term, 'term', 0)

  return `+${term}`
}

/**
 * Higher order function for building strings that always have the same string
 * between two other strings
 *
 * @param {string} patty
 *
 * @returns {string}
 *
 * @example
 * surrounded('OR')('hello', 'world') // -> "hello OR world"
 */
function surrounded (middle) {
  assertString(middle, 'middle', 0)

  return function surround () {
    return Array.prototype.slice.call(arguments).join(` ${middle} `)
  }
}

/**
 * Higher order function for building strings that are surrounderd on both
 * sides of a string
 *
 * @param {string} open
 * @param {string} close
 *
 * @returns {function}
 */
function surrounder (open, close) {
  assertString(open, 'open', 0)
  assertString(close, 'close', 1)

  return function () {
    const middle = Array.prototype.slice.call(arguments)
      .join(' ')

    return `${open} ${middle} ${close}`
  }
}

/**
 * @param {number} left
 * @param {number} right
 *
 * @returns {function}
 */
function within (left, right, value) {
  return ((value >= left) && (value <= right))
}

function assertString (value, name) {
  if (typeof value !== 'string') { throw new TypeError(`${name} should be a string`) }
}

function assertRange (min, max, value, name) {
  if (typeof value !== 'number') { throw new TypeError(`${name} should be a number`) }

  if (value > Number.MAX_SAFE_INTEGER) { throw new RangeError(`${name} should not exceeed "Number.MAX_SAFE_INTEGER"`) }

  if (!within(min, max, value)) { throw new RangeError(`${name} should be between ${min} and ${max}`) }
}

function assertFunction (value, name) {
  if (typeof value !== 'function') { throw new TypeError(`${name} should be a function`) }
}

lucene.phrase = terms
lucene.terms = terms
lucene.term = terms // alias

lucene.field = field

lucene.or = surrounded('OR')
lucene.and = surrounded('AND')
lucene.not = surrounded('NOT')

lucene.group = group
lucene.range = range

lucene.fuzzy = fuzzy
lucene.proximity = proximity
lucene.required = required
lucene.boost = boost

lucene.builder = builder

if (typeof module.exports === 'undefined') { window.lucene = lucene } else { module.exports = lucene }
