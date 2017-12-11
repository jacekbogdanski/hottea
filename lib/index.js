var validators = require('./validators')
var changeset = require('./changeset')
var { mapObj, extend } = require('./utils')

function Changeset(changeset) {
  this.changeset = changeset
}

Changeset.prototype = mapObj(validators, function(key, fn) {
  return function(opts) {
    return new Changeset(fn(opts, this.changeset))
  }
})

function from(data, attrs, params) {
  var model = changeset.cast(data, attrs, params)
  return new Changeset(model)
}

var mod = { from, validators }

module.exports = extend(mod, changeset)
