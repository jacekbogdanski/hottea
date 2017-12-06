var { pick, omit, getByPath, isEqual, extend } = require('./func')

module.exports = {
  cast(data, attrs, params) {
    return {
      data,
      changes: extend(pick(params, attrs)),
      errors: {},
      valid: true
    }
  },
  merge(from, to) {
    if (!isEqual(from.data, to.data))
      throw 'Different data when merging changesets'

    var keys = Object.keys(to.changes)

    return {
      data: to.data,
      changes: extend(from.changes, to.changes),
      errors: extend(omit(keys, from.errors), to.errors),
      valid: from.valid && to.valid
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
    errors = extend(changeset.errors, errors)

    return extend(changeset, { errors, valid: false })
  }
}
