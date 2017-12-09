var {
  pick,
  omit,
  getByPath,
  isEqual,
  extend,
  curry,
  mapObj,
  isUndefined,
  unique
} = require('./utils')

module.exports = mapObj(
  {
    cast: cast,
    castAssoc({ field, change }, attrs, changeset) {
      var assoc = change(changeset.data[field] || {}, attrs || {})

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
    getChange(field, changeset) {
      return getByPath(['changes', field], changeset)
    },
    putChange(field, change, changeset) {
      var changes = {}
      changes[field] = change
      changes = extend(changeset.changes, changes)
      return extend(changeset, { changes })
    },
    getField(field, changeset) {
      return getByPath(['data', field], changeset)
    },
    getErrors(field, changeset) {
      var errors = changeset.errors[field] || []
      return [...errors]
    },
    putError(field, error, changeset) {
      var errorArr = changeset.errors[field] || []
      errorArr = [...errorArr, error]

      var errors = {}
      errors[field] = errorArr
      errors = extend(changeset.errors, errors)

      return extend(changeset, { errors, valid: false })
    },
    deleteChange(key, changeset) {
      var changes = omit([key], changeset.changes)
      var errors = omit([key], changeset.errors)
      return extend(changeset, { changes, errors })
    },
    applyAction(changeset, action) {
      if (!changeset.valid) return [false, changeset]

      var data = applyChanges(changeset)

      return [true, extend(cast(data, {}, []), { action })]
    },
    traverseErrors: traverseErrors,
    applyChanges: applyChanges
  },
  (key, fn) => curry(fn)
)

function cast(data, attrs, fields) {
  var diff = fields.filter(field => !isEqual(data[field], attrs[field]))
  var changes = pick(diff, attrs)

  return {
    data,
    changes,
    errors: {},
    valid: true,
    action: null
  }
}

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

    if (isUndefined(error)) return cur

    if (fn) {
      cur[key] = error.map(opts => fn(key, opts))
      return cur
    }

    cur[key] = error.map(opts => opts.message)
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

function applyChanges(changeset) {
  var { data, changes } = changeset
  var keys = unique([...Object.keys(data), ...Object.keys(changes)])

  return keys.reduce((cur, key) => {
    var change = changes[key]

    if (isChangeset(change)) {
      cur[key] = applyChanges(change)
      return cur
    }

    if (isUndefined(change)) {
      cur[key] = data[key]
      return cur
    }

    cur[key] = change
    return cur
  }, {})
}
