'use strict';

const values     = require('object-values');
const existy     = require('existy');
const complement = require('complement');
const luceneEscapeQuery = require('lucene-escape-query');

/**
 * Lucene Query Builder
 *
 * Lucene query syntax docs (specs)
 * https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Terms
 */

const NAMESPACE = 'lucene';

let lucene = {};

lucene.terms = terms;
lucene.term  = terms; //alias

lucene.field = field;

lucene.or  = surrounded('OR');
lucene.and = surrounded('AND');
lucene.not = surrounded('NOT');

lucene.group = surrounder('(', ')');
lucene.range = range;

lucene.fuzzy     = fuzzy;
lucene.proximity = proximity;
lucene.required  = required;

lucene.builder = builder;

if (typeof module.exports === 'undefined')
  window[NAMESPACE] = lucene;
else
  module.exports = lucene;

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
function builder(fn) {
  return (data) => fn(data);
}

/**
 * Basicly add double quotes around the string
 *
 * @param {string} words
 *
 * @returns {string}
 *
 * @todo make sure lucene query characters are escaped with a \
 */
function terms(words) {
  let escaped = luceneEscapeQuery.escape(words);
  return `"${escaped}"`;
}

/**
 * @param {string} field
 * @param {string} query
 *
 * @returns {string} the format is <field>: <term(s)>
 *
 * @example
 * lucene.field('prop-name', lucene.term('value')) // => 'prop-name: "value"'
 */
function field(field, query) {
  return `${field}: ${query}`;
}

/**
 * The value is between 0 and 1, with a value closer to 1 only terms with a
 * higher similarity will be matched.
 *
 * Fuzzy search can only be applied to a single term
 *
 * @param {string} str
 * @param {number} [similarity=undefined]
 *
 */
function fuzzy(termStr, similarity) {

  if ((complement(existy)(similarity)))
    return `${termStr}~`;

  let isValidSimilarity = within(0,1);

  if (!isValidSimilarity(similarity))
    throw new RangeError('Similarity must be between 0 and 1. It was ' + similarity);

  return `${termStr}~${similarity}`;
}

/**
 * Lucene supports finding words are a within a specific distance away.
 *
 * @param {string} first
 * @param {string} second
 *
 * @param {number} distance
 *
 * @returns {string}
 */
function proximity(first, second, distance) {
  return `"${first} ${second}"~${distance}`;
}

/**
 * Range Queries allow one to match documents whose field(s) values are
 * between the lower and upper bound specified by the Range Query. Range
 * Queries can be inclusive or exclusive of the upper and lower bounds.
 *
 * @param {string}
 * @param {string}
 * @param {boolean} [includeLeft=true]
 * @param {boolean} [includeRight=true]
 *
 * @returns {string}
 */
function range(from, to, includeLeft, includeRight) {
  return surrounder(
    includeLeft  ? '[' : '{',
    includeRight ? ']' : '}'
  )(`${from} TO ${to}`);
}

//banana banana banana
function required(termStr) {
  return `+${termStr}`;
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
function surrounded(middle) {
  return function(){
    return values(arguments).join(` ${middle} `);
  };
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
function surrounder(open, close){
  return function(){
    let middle = values(arguments).join(' ');
    return `${open} ${middle} ${close}`;
  };
}

/**
 * @param {number} left
 * @param {number} right
 *
 * @returns {function}
 *
 * @example
 *
 * within(0,1)(0.5) // => true
 *
 * within(100, 300)(40) // => false
 */
function within(left, right) {
  return function within(value) {
    return ((value >= left) && (value <= right));
  };
}
