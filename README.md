# Lucene Query String Builder

[![NPM](https://img.shields.io/npm/v/lucene-query-string-builder?color=blue&style=flat-square)](https://www.npmjs.com/package/lucene-query-string-builder)
[![NPM Downloads](https://img.shields.io/npm/dm/lucene-query-string-builder?style=flat-square)](https://www.npmjs.com/package/lucene-query-string-builder)
[![Dependency Status](https://img.shields.io/librariesio/release/npm/lucene-query-string-builder?style=flat-square)](https://libraries.io/npm/lucene-query-string-builder)
[![Standard Code Style](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)

## Notice

*Lucene Query String Builder* is looking for a developer to help with the API.
I'll continue performing the maintenance tasks.

Easily build your lucene string queries using small and pure functions.

Imagine having an API that leverages lucene for performing queries on the
(indexed) database. In that case you might want to generate lucene query strings on
the client/front end.

The usage section shows how you can leverage this lib for your purposes.

## Setup

```bash
npm install lucene-query-string-builder --save
```

## Features

- escapes lucene special chars when creating a term string
- contains all the operators lucene uses
- simple lucene.builder function for defining a lucene query builder

## Usage

Let's see how you can use lucene query string builder to define lucene query
strings with simple JavaScript functions.

Assuming that the lucene global variable contains the lucene functions. This
would be the default when loaded into a browser.

```JavaScript

var findUserLuceneQueryString = lucene.builder(function(data){

  // just to make the example more readable;
  var _ = lucene;

  return _.group(_.and(
    _.field('eye-color', _.term(data.eye.color)),
    _.field('age', _.range(data.age.min, data.age.max))
  ));

});

var luceneQueryString = findUserLuceneQueryString({
  eye: { color: 'brown'},
  age: {
    min: 10,
    max: 20
  }
});

luceneQueryString === '( eye-color: "brown" AND age:{ 10 TO 20 } )' // => true

```
The functions are based on the lucene specifications found here:
https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Terms

```JavaScript

  var _ = lucene;

  /***
   * terms or term
   */

  _.term('hello'); // => '"hello"'

  _.terms('hello world'); // => '"hello world"'


  /***
   * field
   */

  _.field('hello', _.term('world')); // => 'hello: "world"'


  /***
   * or/and/not
   *
   * These functions are variadic and all work the same way. This example only
     shows the or but it works similar with and and not
   */

  _.or(_.term('hello'), _.term('world')); // => '"hello" OR "world"'

  _.or(_.term('hello'), _.term('you'), _.term('world')); // => '"hello" OR "you" OR "world"'


  /***
   * group
   *
   * Is a variadic function too
   */

  _.group(_.term('hello'), _.term('you'), _.term('world')); // => '( "hello" "you" "world" )'


  /***
   * range
   *
   * Takes two strings and 2 booleans.
   */

  /* combined with the field function to query for ages between 10 and 20 */
  _.field('age', _.range(10, 20)); // => 'age: { 10 TO 20 }'


  /***
   * fuzzy
   */

  _.fuzzy(_.term('hello'), 0.2); // => '"hello"~0.2'


  /***
   * proximity
   */

  _.proximity("a", "c", 2); // => '"a b"'~2


  /***
   * required
   */

  _.required(_.term('required')); // => '+"required"'

```

## Tests

```bash bash
set -eo pipefail

{
  npm i
  npm prune
} > /dev/null

npx standard --fix
npx nyc npm t
```
```

> lucene-query-string-builder@1.0.7 test
> tape ./test/index.js

TAP version 13
# builder
ok 1 should be strictly equal
# range
ok 2 should be strictly equal
ok 3 should be strictly equal
ok 4 should be strictly equal
ok 5 should be strictly equal
# group
ok 6 should be strictly equal
# term
ok 7 should be strictly equal
ok 8 should be strictly equal
# fuzzy
ok 9 should throw
ok 10 should be strictly equal
ok 11 should be strictly equal
ok 12 should be strictly equal
ok 13 should be strictly equal
ok 14 should be strictly equal
ok 15 should be strictly equal
# proximity
ok 16 should be strictly equal
ok 17 should throw
ok 18 should throw
ok 19 should throw
ok 20 should throw
ok 21 should throw
# or/and/not
ok 22 should be strictly equal
ok 23 should be strictly equal
ok 24 should be strictly equal
ok 25 should be strictly equal
ok 26 should be strictly equal
ok 27 should be strictly equal

1..27
# tests 27
# pass  27

# ok

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |   90.32 |    94.44 |   88.24 |   90.91 |                   
 index.js |   90.32 |    94.44 |   88.24 |   90.91 | 69-72,165-167     
----------|---------|----------|---------|---------|-------------------
```

## Contributing

I have not gotten the chance to use this lib in my own projects. Please share
your thoughts, issues and improvements.

- Make sure your dependencies are installed by running: `npm run-script setup`
- Then start editing the index.js
- You should add and/or edit the tests in test/index.js
- Run your tests and see what happens

When performing pull request make sure to not add the **dist** files. This is left
to the maintainers(s) of the library. They are responsible to version and avoid
code breakages.

You can perform your own build with `npm run-script` build to make a *lucine.js* and
a *lucine.min.js*

**notice**

I am currently not using this repository in any of my projects. Therefore I am looking
for people that are able to make LQSB more useful for them and others.

## Road map

- split all functions into separate files
- tasks for running tests on dist/lucene.js and dist/lucene.min.js

## License

The MIT License (MIT)
