var {
  pick,
  omit,
  getByPath,
  isEqual,
  extend,
  unique,
  curry,
  mapObj
} = require('./utils')

module.exports = mapObj(
  {
    cast(data, attrs, params) {
      var diff = params.filter(param => !isEqual(data[param], attrs[param]))
      var changes = pick(diff, attrs)

      return {
        data,
        changes,
        errors: {},
        valid: true
      }
    },
    castAssoc({ field, change }, attrs, changeset) {
      var assoc = change(changeset.data[field], attrs || {})

      if (!Object.keys(assoc.changes).length) return changeset

      var changes = {}
      changes[field] = assoc
      changes = extend(changeset.changes, changes)

      return extend(changeset, {
        changes,
        valid: changeset.valid && assoc.valid
      })
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
    view(changeset, fields = null) {
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
    },
    traverseErrors: traverseErrors
  },
  (key, fn) => curry(fn)
)

function traverseErrors(changeset, fn = null) {
  var { errors, changes } = changeset
  var keys = Object.keys(changes)

  return keys.reduce((cur, key) => {
    var error = errors[key]
    var change = changes[key]

    if (isChangeset(change)) {
      cur[key] = traverseErrors(change, fn)
      return cur
    }
    if (fn) {
      cur[key] = error.map(message => fn(key, message))
      return cur
    }
    cur[key] = [...error]
    return cur
  }, {})
}

function isChangeset(obj) {
  return (
    obj &&
    obj.hasOwnProperty('data') &&
    obj.hasOwnProperty('changes') &&
    obj.hasOwnProperty('errors') &&
    obj.hasOwnProperty('valid')
  )
}
