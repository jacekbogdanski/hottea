var { isUndefined } = require('./func')
var { getChange, getData, putError } = require('./changeset')

module.exports = {
  required(params, changeset) {
    var valid = attr =>
      (typeof attr === 'string' && !/^\s*$/.test(attr)) ||
      typeof attr === 'number' ||
      typeof attr === 'boolean' ||
      typeof attr === 'object'

    return params.reduce((changeset, param) => {
      var value = getChange(param, changeset) || getData(param, changeset)
      return !isUndefined(value) && valid(value)
        ? changeset
        : putError(param, "can't be blank", changeset)
    }, changeset)
  },
  length(min, max, params, changeset) {
    return params.reduce((changeset, param) => {
      var value = getChange(param, changeset)
      if (isUndefined(value)) return changeset

      var isString = typeof value === 'string'
      if (!(isString || Array.isArray(value)))
        throw `Invalid type of "${param}". Valid types: string, array.`

      var length = value.length
      var errors = isString
        ? {
            is: x => `should be ${x} character(s)`,
            min: x => `should be at least ${x} character(s)`,
            max: x => `should be at most ${x} character(s)`
          }
        : {
            is: x => `should have ${x} items(s)`,
            min: x => `should have at least ${x} items(s)`,
            max: x => `should have at most ${x} items(s)`
          }

      if (min == max && min == length)
        return putError(param, errors.is(min), changeset)

      if (length < min) return putError(param, errors.min(min), changeset)

      if (length > max) return putError(param, errors.max(max), changeset)

      return changeset
    }, changeset)
  },
  acceptance(params, changeset) {
    return params.reduce((changeset, param) => {
      var value = getChange(param, changeset)
      if (typeof value !== 'boolean')
        throw `Invalid type of ${param}. Valid types: boolean.`

      if (value) return changeset
      return putError(param, 'must be accepted', changeset)
    }, changeset)
  },
  change(validator, params, changeset) {
    return params.reduce((changeset, param) => {
      var value = getChange(param, changeset)
      if (isUndefined(value)) return changeset

      return validator(value).reduce(
        (changeset, error) => putError(param, error, changeset),
        changeset
      )
    }, changeset)
  },
  confirmation(params, changeset) {
    return params.reduce((changeset, param) => {
      var value = getChange(param, changeset)
      if (isUndefined(value)) return changeset

      var confirmationParam = param + 'Confirmation'
      var confirmation = getChange(confirmationParam, changeset)

      if (value === confirmation) return changeset
      return putError(param, 'does not match', changeset)
    }, changeset)
  },
  exclusion(params, reserved, changeset) {
    return params.reduce((changeset, param) => {
      var value = getChange(param, changeset)
      if (isUndefined(value)) return changeset
      if (!reserved.some(x => x === value)) return changeset

      return putError(param, 'is reserved', changeset)
    }, changeset)
  }
}
