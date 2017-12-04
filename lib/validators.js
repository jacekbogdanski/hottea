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
      return value !== undefined && valid(value)
        ? changeset
        : putError(param, "can't be blank", changeset)
    }, changeset)
  },
  length(min, max, params, changeset) {
    return params.reduce((changeset, param) => {
      var value = getChange(param, changeset)
      if (!value) return changeset

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
  }
}
