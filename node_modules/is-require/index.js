module.exports = isRequire

function isRequire(word) {
  word = word || 'require'

  return function(node) {
    var c = node && node.callee
    return c
      && c.name === word
      && c.type === 'Identifier'
      && node.type === 'CallExpression'
  }
}
