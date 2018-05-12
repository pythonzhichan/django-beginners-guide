# fresh-require
![](http://img.shields.io/badge/stability-experimental-orange.svg?style=flat)
![](http://img.shields.io/npm/v/fresh-require.svg?style=flat)
![](http://img.shields.io/npm/dm/fresh-require.svg?style=flat)
![](http://img.shields.io/npm/l/fresh-require.svg?style=flat)

Bypass the require cache when requiring a module – works with both node and
[browserify](http://browserify.org/).

## Usage

[![NPM](https://nodei.co/npm/fresh-require.png)](https://nodei.co/npm/fresh-require/)

### `fresh(module, require)`

Where `module` is the name of the module you're requiring, as you would normally
pass to `require`. `require` should be your file's local `require` function.

To use this package properly with browserify, you need to include
`fresh-require/transform` as a transform:

``` bash
browserify -t fresh-require/transform ./index.js
```

Then you should be able to use the package as normal:

``` javascript
var fresh = require('fresh-require')

var async1 = require('async')
var async2 = fresh('async', require)
```

## License

MIT. See [LICENSE.md](http://github.com/hughsk/fresh-require/blob/master/LICENSE.md) for details.
