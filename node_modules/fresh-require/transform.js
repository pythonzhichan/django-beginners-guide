var copy      = require('shallow-copy')
var isreq     = require('is-require')
var escodegen = require('escodegen')
var through   = require('through2')
var resolve   = require('resolve')
var sleuth    = require('sleuth')
var acorn     = require('acorn')
var astw      = require('astw')
var path      = require('path')

module.exports = fresh

var parent = (
    '( arguments.length === 3'
  + '? arguments.callee.caller'
  + ': arguments.callee.caller.caller'
  + ')'
)

var root   = require.resolve('./')
var topref = acorn.parse(parent).body[0].expression
var argref = acorn.parse(parent + '.arguments[0]').body[0].expression

function fresh(filename) {
  if (path.extname(filename) === '.json') return through()

  var buffer = []

  return through(write, flush)

  function write(data, _, next) {
    buffer.push(data)
    next()
  }

  function flush() {
    var src  = buffer.join('')
    var ast  = acorn.parse(src)
    var free = getFree(src)
    var walk = astw(ast)

    var requires = sleuth(ast)
    var match = null

    Object.keys(requires).some(function(key) {
      var reqpath = requires[key]
      if (reqpath === 'fresh-require') return match = key
      if (filename.indexOf(__dirname) === -1) return false
      if (reqpath.charAt(0) !== '.') return false

      // special case for tests
      var resolved = resolve.sync(reqpath, {
        basedir: path.dirname(filename)
      })

      if (resolved === root) return match = key
    })

    if (!match) {
      this.push(src)
      this.push(null)
      return
    }

    var fresh   = isreq(match)
    var topname = free()
    var argname = free()

    ast.body.unshift({
        type: 'VariableDeclaration'
      , kind: 'var'
      , declarations: [{
          type: 'VariableDeclarator'
        , init: topref
        , id: {
            type: 'Identifier'
          , name: topname
        }
      }, {
          type: 'VariableDeclarator'
        , init: argref
        , id: {
            type: 'Identifier'
          , name: argname
        }
      }]
    })

    walk(function(node) {
      if (!fresh(node)) return
      var name = node.arguments[0].value

      node.arguments[1] = {
          type: 'Identifier'
        , name: topname
      }

      node.arguments[2] = {
          type: 'Identifier'
        , name: argname
      }

      var original = copy(node)

      replace(node, {
          type: 'LogicalExpression'
        , operator: '||'
        , left: original
        , right: acorn.parse('require('+JSON.stringify(name)+')').body[0].expression
      })
    })

    this.push(escodegen.generate(ast))
    this.push(null)
  }
}


function getFree(src) {
  var n = 0
  while (src.indexOf('$' + n) !== -1) n++

  return function() {
    return '$' + n++
  }
}

function replace(a, b) {
  Object.keys(a).forEach(function(key) {
    delete a[key]
  })
  Object.keys(b).forEach(function(key) {
    a[key] = b[key]
  })
}
