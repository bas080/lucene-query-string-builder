# Lucene Query String Builder

More easily build your lucene string queries using small and pure functions.

The usage section shows how you can leverage this lib for your purposes.

## Use cases

Imagine having an API that leverages lucene for performing queries on the
(indexed) database. In that case you might want to generate lucene query strings on
the client/front end.

## Installation

```bash
bower install lucene-query-builder --save

# or

npm install lucene-query-builder --save
```

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

luceneQueryString == "( eye-color: "brown" AND age:{ 10 TO 20 } )" // => true

```
The functions  are based on the lucene specifications found here:
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
     shows the or but ot works similar with and and not
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

## Contributing

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
- escaping lucene query syntax characters in the term(s) function
- tasks for running tests on dist/lucene.js and dist/lucene.min.js

## License

The MIT License (MIT)
