var { isUndefined, mapObj, curry } = require('./func')
var { getChange, getData, putError } = require('./changeset')

module.exports = mapObj(
  {
    required({ fields, message = "can't be blank" }, changeset) {
      var valid = attr =>
        (typeof attr === 'string' && !/^\s*$/.test(attr)) ||
        typeof attr === 'number' ||
        typeof attr === 'boolean' ||
        typeof attr === 'object'

      return fields.reduce((changeset, field) => {
        var value = getChange(field, changeset) || getData(field, changeset)
        return !isUndefined(value) && valid(value)
          ? changeset
          : putError(field, message, changeset)
      }, changeset)
    },
    length({ message, min, max, fields }, changeset) {
      return fields.reduce((changeset, field) => {
        var value = getChange(field, changeset)
        if (isUndefined(value)) return changeset

        var isString = typeof value === 'string'
        if (!(isString || Array.isArray(value)))
          throw `Invalid type of "${field}". Valid types: string, array.`

        var length = value.length
        var errors =
          message || isString
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
          return putError(field, errors.is(min), changeset)

        if (length < min) return putError(field, errors.min(min), changeset)

        if (length > max) return putError(field, errors.max(max), changeset)

        return changeset
      }, changeset)
    },
    acceptance({ message = 'must be accepted', fields }, changeset) {
      return fields.reduce((changeset, field) => {
        var value = getChange(field, changeset)
        if (typeof value !== 'boolean')
          throw `Invalid type of ${field}. Valid types: boolean.`

        if (value) return changeset
        return putError(field, message, changeset)
      }, changeset)
    },
    change({ validator, fields }, changeset) {
      return fields.reduce((changeset, field) => {
        var value = getChange(field, changeset)
        if (isUndefined(value)) return changeset

        return validator(value).reduce(
          (changeset, error) => putError(field, error, changeset),
          changeset
        )
      }, changeset)
    },
    confirmation({ message = 'does not match', fields }, changeset) {
      return fields.reduce((changeset, field) => {
        var value = getChange(field, changeset)
        if (isUndefined(value)) return changeset

        var confirmationField = field + 'Confirmation'
        var confirmation = getChange(confirmationField, changeset)

        if (value === confirmation) return changeset
        return putError(field, message, changeset)
      }, changeset)
    },
    exclusion({ message = 'is reserved', fields, reserved }, changeset) {
      return fields.reduce((changeset, field) => {
        var value = getChange(field, changeset)
        if (isUndefined(value)) return changeset
        if (!reserved.some(x => x === value)) return changeset

        return putError(field, message, changeset)
      }, changeset)
    },
    inclusion({ message = 'is invalid', fields, include }, changeset) {
      return fields.reduce((changeset, field) => {
        var value = getChange(field, changeset)
        if (isUndefined(value)) return changeset
        if (include.some(x => x === value)) return changeset

        return putError(field, message, changeset)
      }, changeset)
    },
    format({ message = 'has invalid format', fields, match }, changeset) {
      return fields.reduce((changeset, field) => {
        var value = getChange(field, changeset)
        if (isUndefined(value)) return changeset

        if (typeof value !== 'string')
          throw `Invalid type of ${field}. Valid types: string.`

        if (value.match(match)) return changeset
        return putError(field, message, changeset)
      }, changeset)
    },
    lessThan({ message, number, fields }, changeset) {
      message = message || `must be less than ${number}`
      return fields.reduce((changeset, field) => {
        var value = getChange(field, changeset)
        if (isUndefined(value)) return changeset

        return value < number ? changeset : putError(field, message, changeset)
      }, changeset)
    },
    greaterThan({ message, number, fields }, changeset) {
      message = message || `must be greater than ${number}`
      return fields.reduce((changeset, field) => {
        var value = getChange(field, changeset)
        if (isUndefined(value)) return changeset

        return value > number ? changeset : putError(field, message, changeset)
      }, changeset)
    },
    lessThanOrEqualTo({ message, number, fields }, changeset) {
      message = message || `must be less than or equal to ${number}`
      return fields.reduce((changeset, field) => {
        var value = getChange(field, changeset)
        if (isUndefined(value)) return changeset

        return value <= number ? changeset : putError(field, message, changeset)
      }, changeset)
    },
    greaterThanOrEqualTo({ message, number, fields }, changeset) {
      message = message || `must be greater than or equal to ${number}`
      return fields.reduce((changeset, field) => {
        var value = getChange(field, changeset)
        if (isUndefined(value)) return changeset

        return value >= number ? changeset : putError(field, message, changeset)
      }, changeset)
    },
    equalTo({ message, number, fields }, changeset) {
      message = message || `must be equal to ${number}`
      return fields.reduce((changeset, field) => {
        var value = getChange(field, changeset)
        if (isUndefined(value)) return changeset

        return value == number ? changeset : putError(field, message, changeset)
      }, changeset)
    }
  },
  (key, fn) => curry(fn)
)
