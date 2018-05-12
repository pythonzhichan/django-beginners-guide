module.exports = fresh

function fresh(file, require) {
  file = require.resolve(file)

  var tmp = require.cache[file]
  delete require.cache[file]

  var mod = require(file)

  require.cache[file] = tmp

  return mod
}
