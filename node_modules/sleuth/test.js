var esprima = require('esprima')
var test = require('tape')
var sleuth = require('./')
var fs = require('fs')

var fixture = fs.readFileSync(
  __dirname + '/fixture.js'
, 'utf8')

test('sleuth', function(t) {
  var ast = esprima.parse(fixture)
  var results = sleuth(ast)

  t.plan(1)
  t.deepEqual(results, {
      x: 'y'
    , a: 'b'
    , c: 'd'
    , e: 'e'
    , letter: 'let'
    , constant: 'const'
    , splits: 'another thing'
  })
})

