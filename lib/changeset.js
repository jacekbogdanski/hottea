var { pick, getByPath } = require('./func')

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
  },
  getChange(param, changeset) {
    return getByPath(['changes', param], changeset)
  },
  getData(param, changeset) {
    return getByPath(['data', param], changeset)
  },
  putError(param, error, changeset) {
    var errorArr = changeset.errors[param] || []
    errorArr = [...errorArr, error]

    var errors = {}
    errors[param] = errorArr
    errors = Object.assign({}, changeset.errors, errors)

    return Object.assign({}, changeset, { errors, valid: false })
  }
}

function isChangeset(obj) {
  return (
    obj.hasOwnProperty('data') &&
    obj.hasOwnProperty('changes') &&
    obj.hasOwnProperty('action')
  )
}
