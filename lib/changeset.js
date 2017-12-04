var { pick, compose } = require('./func')

module.exports = {
  cast(struct, attrs, params) {
    var data = struct
    var changes = {}
    var action = null

    if (isChangeset(struct)) {
      data = struct.data
      changes = struct.changes
      action = struct.action
    }

    return {
      data,
      action,
      changes: Object.assign({}, pick(params, attrs), changes),
      errors: {},
      valid: true
    }
  }
}

function isChangeset(obj) {
  return (
    obj.hasOwnProperty('data') &&
    obj.hasOwnProperty('changes') &&
    obj.hasOwnProperty('action')
  )
}
