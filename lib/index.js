var validators = require('./validators')
var changeset = require('./changeset')
var { mapObj, extend } = require('./utils')

function Changeset(changeset) {
  this.changeset = changeset
}

function extendChangeset(validators) {
  return mapObj(validators, function(key, fn) {
    return function(opts) {
      return new Changeset(fn(opts, this.changeset))
    }
  })
}

Changeset.prototype = extendChangeset(validators)

/**
 * Creates changeset wrapped in fluent validation object.
 * You can use every validator against wrapped changeset.
 * @param {Object} data - model data of the entity
 * @param {Object} attrs - changes to the changeset
 * @params {Array} params - changes to pick
 */
function from(data, attrs, params) {
  var model = changeset.cast(data, attrs, params)
  return new Changeset(model)
}

/**
 * Extends fluent validation with custom validators.
 * @param {Object} validators - enumerable object where key is a validator name, and value function(opts:object, changeset:Changeset)
 */
from.extend = function(validators) {
  Changeset.prototype = extend(extendChangeset(validators), Changeset.prototype)
}

var mod = { from, validators }

module.exports = extend(mod, changeset)
