var { pick, omit, getByPath, isEqual, extend, unique } = require('./utils')

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
  view(changeset, fields) {
    var { data, changes, errors, valid } = changeset

    fields =
      fields ||
      unique([
        ...Object.keys(data),
        ...Object.keys(changes),
        ...Object.keys(errors)
      ])

    return fields.reduce(
      (view, field) => {
        view[field] = {
          value: changes[field] || data[field] || null,
          errors: errors[field] || []
        }
        return view
      },
      { __valid__: valid }
    )
  },
  getChange(param, changeset) {
    return getByPath(['changes', param], changeset)
  },
  putChange(param, change, changeset) {
    var changes = {}
    changes[param] = change
    changes = extend(changeset.changes, changes)
    return extend(changeset, { changes })
  },
  getData(param, changeset) {
    return getByPath(['data', param], changeset)
  },
  getErrors(param, changeset) {
    var errors = changeset.errors[param] || []
    return [...errors]
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
