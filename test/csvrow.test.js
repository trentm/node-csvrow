/*
 * Test csvrow parsing.
 */

var format = require('util').format;
var test = require('tap').test;
var csvrow = require('../lib/csvrow');



test('csvrow.stringify', function (t) {
  var samples = [
    ['a,b,c', ['a', 'b', 'c']],
    ['a', ['a']],

    // Quoting
    ['"a b"', ['a b']],
    ['"a "" b"', ['a " b']],
    ['"a ""b"""', ['a "b"']],
    ['"a b",c,"d "', ['a b', 'c', 'd ']],
    ['" a "', [' a ']],

    // Gross edge cases.
    ['', []],
    [',a', ['', 'a']],
    [',', ['', '']]
  ];

  samples.forEach(function (samples) {
    t.equal(samples[0], csvrow.stringify(samples[1]),
      format('csvrow.stringify(%s) => \'%s\'',
             JSON.stringify(samples[1]),
             samples[0]));
  });
  t.end();
});


test('csvrow.normalize', function (t) {
  var samples = [
    ['a,,', 'a'],
    [' a ', 'a'],
    ['a, b, c', 'a,b,c'],
    ['a, b, c," d "', 'a,b,c," d "'],
  ];

  samples.forEach(function (samples) {
    t.equal(csvrow.normalize(samples[0]), samples[1],
      format('csvrow.normalize(\'%s\') => \'%s\'',
             samples[0], samples[1]));
  });
  t.end();

})

test('csvrow.parse', function (t) {
  var p = csvrow.parse;

  var samples = [
    ['a,b,c', ['a', 'b', 'c']],
    ['a', ['a']],

    // Trimming
    [' a', ['a']],
    ['a ', ['a']],
    [' a ', ['a']],
    ['\t a\t', ['a']],

    // Quoting
    ['"a"', ['a']],
    ['"a b"', ['a b']],
    ['"a "" b"', ['a " b']],
    ['"a ""b"""', ['a "b"']],
    ['"a b",c ,"d "', ['a b', 'c', 'd ']],
    ['" a "', [' a ']],

    // Gross edge cases.
    ['', []],
    [',a', ['', 'a']],
    [',', ['', '']],
    ['""', ['']]
  ];

  samples.forEach(function (samples) {
    t.deepEqual(p(samples[0]), samples[1],
      format('csvrow.parse(\'%s\') => %s', samples[0],
        JSON.stringify(samples[1])));
  });
  t.end();
});
