var isRequire = require('is-require')('require')
var evaluate  = require('static-eval')

module.exports = sleuth

function sleuth(ast) {
  var discovered = {}
  var nodes = ast.body
  var l = nodes.length

  for (var i = 0; i < l; i++) {
    if (nodes[i].type !== 'VariableDeclaration') continue

    var declarations = nodes[i].declarations
    var d = declarations.length

    for (var j = 0; j < d; j++) {
      var node = declarations[j]
      var init = node.init

      if (node.type !== 'VariableDeclarator') continue
      if (!isRequire(init)) continue

      var path = init.arguments.length && (
        init.arguments[0].type === 'Literal'
          ? init.arguments[0].value
          : evaluate(init.arguments[0])
      )

      var name = (
        node.id &&
        node.id.name
      )

      if (path && name) {
        discovered[name] = path
      }
    }
  }

  return discovered
}
