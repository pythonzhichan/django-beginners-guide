# is-require [![Flattr this!](https://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=hughskennedy&url=http://github.com/hughsk/is-require&title=is-require&description=hughsk/is-require%20on%20GitHub&language=en_GB&tags=flattr,github,javascript&category=software)[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges) #

Tests whether an JavaScript AST node is likely to be a valid `require` call.
Mostly for convenience, seeing as I've had to copy/paste it a few times now.

## Usage ##

[![is-require](https://nodei.co/npm/is-require.png?mini=true)](https://nodei.co/npm/is-require)

### `isRequire = require('is-require')([name])` ###

Returns a function which tests AST nodes for `require` calls. You can supply
your own function name to `name` to use something other than require.

### `isRequire(node)` ###

Tests an AST node to see if it is a `require` call.

``` javascript
var isImports = require('is-require')('imports')
var isRequire = require('is-require')()
var esprima = require('esprima')
var astw = require('astw')
var fs = require('fs')

var src = fs.readFileSync('some-file.js', 'utf8')
var ast = esprima.parse(src)
var walk = astw(ast)

walk(function(node) {
  if (!isRequire(node)) return
  // do things...
})

walk(function(node) {
  if (!isImports(node)) return
  // do things...
})
```

## License ##

MIT. See [LICENSE.md](http://github.com/hughsk/is-require/blob/master/LICENSE.md) for details.
