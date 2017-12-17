var validators = require('./validators')
var changeset = require('./changeset')
var utils = require('./utils')

function Changeset(changeset) {
  this.changeset = changeset
}

function extendChangeset(validators) {
  return utils.mapObj(validators, function(key, fn) {
    return function(opts) {
      return new Changeset(fn(opts, this.changeset))
    }
  })
}

Changeset.prototype = extendChangeset(validators)

/**
 * Creates changeset wrapped in fluent validation object.
 * You can use every validator against wrapped changeset.
 * @param {Object} data - entity model data
 * @param {Object} attrs - changes
 * @param {Array} params - changes to pick
 * @property {object} changeset - current changeset
 * @example from({id: 1, title: 'title'}, {title: 'new title', body: 'body'}, ['title', 'body'])
 * @returns {Changeset}
 */
function from(data, attrs, params) {
  var model = changeset.cast(data, attrs, params)
  return new Changeset(model)
}

/**
 * Extends fluent validation with custom validators.
 * @memberof from
 * @param {Object} validators - enumerable object where key is a validator name, and value function(opts:object, changeset:Changeset)
 * @example from.extend({required: function required(opts, changeset) { ... } })
 */
from.extend = function(validators) {
  Changeset.prototype = utils.extend(
    extendChangeset(validators),
    Changeset.prototype
  )
}

module.exports = { validators, changeset, from }
