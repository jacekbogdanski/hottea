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

/**
 * Allows for creating and manipulating changesets. As an entry point to create changeset use cast function.
 * @namespace changeset
 */

module.exports = mapObj(
  {
    cast,
    getChange,
    putChange,
    getField,
    putError,
    getErrors,
    merge,
    castAssoc,
    traverseErrors,
    applyChanges,
    deleteChange,
    applyAction,
    change
  },
  (key, fn) => curry(fn)
)

/**
 * Casts association with the changeset parameters.
 * @function cast
 * @memberof changeset
 * @param {Object} data - entity model data
 * @param {Object} attrs - changes
 * @param {Array} params - changes to pick
 * @example cast({id: 1, title: 'title'}, {title: 'new title', body: 'body'}, ['title', 'body'])
 * @returns {Object} changeset
 */
function castAssoc({ field, change }, attrs, changeset) {
  var assoc = change(changeset.data[field] || {}, attrs || {})

  if (!Object.keys(assoc.changes).length) return changeset

  var changes = {}
  changes[field] = assoc
  changes = extend(changeset.changes, changes)

  return extend(changeset, {
    changes,
    valid: changeset.valid && assoc.valid
  })
}

/**
 * Gets change from the changeset.
 * @function getChange
 * @memberof changeset
 * @param field {String} - name of the change field
 * @param changeset {Object} - changeset with expected change
 * @returns {Array} Success/Error Array tuple with the change value
 * @example
 * // when change exists
 * getChange('title', changeset) === [true, 'some title']
 * // when change does not exist
 * getChange('title', changeset) === [false, null]
 */
function getChange(field, changeset) {
  var change = getByPath(['changes', field], changeset)
  if (isUndefined(change)) return [false, null]
  return [true, change]
}

/**
 * Puts change into changeset for the given field
 * @function putChange
 * @memberof changeset
 * @param field {String} - name of the change field
 * @param change {Any} - value of the change
 * @param changeset {Object} - target changeset
 * @returns {Object} changeset with the given change
 */
function putChange(field, change, changeset) {
  var changes = {}
  changes[field] = change
  changes = extend(changeset.changes, changes)
  return extend(changeset, { changes })
}

/**
 * Gets field from the changeset.
 * @function getField
 * @memberof changeset
 * @param field {String} - name of the field
 * @param changeset {Object} - changeset with expected field
 * @returns {Array} Success/Error Array tuple with the field value
 * @example
 * // when field exists
 * getField('title', changeset) === [true, 'some title']
 * // when field does not exist
 * getField('title', changeset) === [false, null]
 */
function getField(field, changeset) {
  var value = getByPath(['data', field], changeset)
  if (isUndefined(value)) return [false, null]
  return [true, value]
}

/**
 * Gets errors from the changeset for the given field.
 * @function getErrors
 * @memberof changeset
 * @param field {String} - name of the field
 * @param changeset {Object} - changeset with expected errors
 * @returns {Array} field errors
 */
function getErrors(field, changeset) {
  var errors = changeset.errors[field] || []
  return [...errors]
}

/**
 * Puts error to the changeset for given field
 * @function putError
 * @memberof changeset
 * @param field {String} - name of the field
 * @param error {Any} - works with any data, but preferably object with message:String property
 * @param changeset {Object} - target changeset
 * @returns {Object} changeset with given errors
 */
function putError(field, error, changeset) {
  var errorArr = changeset.errors[field] || []
  errorArr = [...errorArr, error]

  var errors = {}
  errors[field] = errorArr
  errors = extend(changeset.errors, errors)

  return extend(changeset, { errors, valid: false })
}

/**
 * Deletes change from the changeset
 * @function deleteChange
 * @memberof changeset
 * @param field {String} - name of the field
 * @changeset {Object} - target changeset
 * @returns {Object} changeset without given change
 */
function deleteChange(field, changeset) {
  var changes = omit([field], changeset.changes)
  var errors = omit([field], changeset.errors)
  return extend(changeset, { changes, errors })
}

/**
 * Applies action to the changeset only if the changes are valid.
 * If the changes are valid all changes will be merged with the data model.
 * @function applyAction
 * @memberof changeset
 * @param changeset {Object} - target changeset
 * @param action {String} - action name
 * @returns {Array} Success/Error Array tuple
 * @example
 * // with valid changes
 * applyChanges(oldChangeset, 'INSERT') === [true, oldChangeset]
 * oldChangeset.action === null
 * // with invalid changes
 * applyChanges(oldChangeset, 'INSERT') === [false, newChangeset]
 * newChangeset.action === 'INSERT'
 */
function applyAction(changeset, action) {
  if (!changeset.valid) return [false, changeset]

  var data = applyChanges(changeset)

  return [true, extend(cast(data, {}, []), { action })]
}
/**
 * Applies changes to the given changeset.
 * @function change
 * @memberof changeset
 * @param change {Function} - cast function with signature (data:{Object}, attrs:{Object}) -> changeset
 * @param changeset {Object} - target changeset
 * @param attrs {Object} - changes to apply
 */
function change(change, changeset, attrs) {
  var newChangeset = change(changeset.data, attrs)
  return merge(changeset, newChangeset)
}

/**
 * Applies properties as changes for the data model according to the set of keys.
 * @function cast
 * @memberof changeset
 * @param {Object} data - entity model data
 * @param {Object} attrs - changes
 * @param {Array} params - changes to pick
 * @example cast({id: 1, title: 'title'}, {title: 'new title', body: 'body'}, ['title', 'body'])
 * @returns {Object} changeset
 */
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

/**
 * Traverses through changeset errors and associations. With the given transform function will apply it to the error messages.
 * @function traverseErrors
 * @memberof changeset
 * @param changeset {Object} - target changeset
 * @param fn {Function} - transform function
 * @returns {Object} object with changeset errors corresponding to the changeset graph
 * @example
 * traverseErrors(changeset, function transform(field, opts){
 *  return `${field}: ${opts.message}`
 * })
 */
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

/**
 * Applies changes to the data model regardless if the changes are valid or not.
 * @function applyChanges
 * @memberof changeset
 * @param changeset {Object} - target changeset
 * @returns {Object} data
 */
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

/**
 * Merges two changesets with the same data model.
 * If data models are not equal, function will throw error.
 * Changes, errors and action are merged into the second changeset.
 * @function merge
 * @memberof changeset
 * @param from {Object} from - source changeset
 * @param from {Object} to - target changeset
 * @returns {Object} changeset
 */
function merge(from, to) {
  if (!isEqual(from.data, to.data))
    throw 'Different data when merging changesets'

  var keys = Object.keys(to.changes)

  return {
    data: to.data,
    changes: extend(from.changes, to.changes),
    errors: extend(omit(keys, from.errors), to.errors),
    valid: from.valid && to.valid
  }
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
