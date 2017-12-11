var { mapObj, curry, pipe, isEqual } = require('./utils')
var { getChange, getField, putError, putChange } = require('./changeset')

module.exports = mapObj(
  {
    required({ fields, message = "can't be blank" }, changeset) {
      var valid = attr =>
        (typeof attr === 'string' && !/^\s*$/.test(attr)) ||
        typeof attr === 'number' ||
        typeof attr === 'boolean' ||
        (typeof attr === 'object' && attr !== null)

      return fields.reduce((changeset, field) => {
        var [ok, value] = getChange(field, changeset)

        if (!ok) {
          ;[ok, value] = getField(field, changeset)
        }

        return valid(value)
          ? changeset
          : pipe(
              putError(field, { message, validation: 'required' }),
              putChange(field, null)
            )(changeset)
      }, changeset)
    },
    length({ message: customMessage, min, max, fields }, changeset) {
      return fields.reduce((changeset, field) => {
        var [ok, value] = getChange(field, changeset)
        if (!ok) return changeset

        var isString = typeof value === 'string'
        if (!(isString || Array.isArray(value)))
          throw `Invalid type of "${field}". Valid types: string, array.`

        var messages = isString
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

        var length = value.length
        var message

        if (min == max && min == length) message = messages.is(min)
        if (length < min) message = messages.min(min)
        if (length > max) message = messages.max(max)

        if (message)
          return putError(
            field,
            {
              message: customMessage || message,
              validation: 'length',
              min,
              max
            },
            changeset
          )

        return changeset
      }, changeset)
    },
    acceptance({ message = 'must be accepted', fields }, changeset) {
      return fields.reduce((changeset, field) => {
        var [ok, value] = getChange(field, changeset)
        if (!ok) return changeset

        if (typeof value !== 'boolean')
          throw `Invalid type of ${field}. Valid types: boolean.`

        if (value) return changeset
        return putError(field, { message, validation: 'acceptance' }, changeset)
      }, changeset)
    },
    change({ validator, fields }, changeset) {
      return fields.reduce((changeset, field) => {
        var [ok, value] = getChange(field, changeset)
        if (!ok) return changeset

        return validator(value).reduce(
          (changeset, error) => putError(field, error, changeset),
          changeset
        )
      }, changeset)
    },
    confirmation({ message = 'does not match', fields }, changeset) {
      return fields.reduce((changeset, field) => {
        var confirmationField = field + 'Confirmation'

        var [okValue, value] = getChange(field, changeset)
        var [okConfirmation, confirmation] = getChange(
          confirmationField,
          changeset
        )

        if (!okValue && !okConfirmation) return changeset

        if (isEqual(value, confirmation)) return changeset
        return putError(
          field,
          { message, validation: 'confirmation', confirmation },
          changeset
        )
      }, changeset)
    },
    exclusion({ message = 'is reserved', fields, reserved }, changeset) {
      return fields.reduce((changeset, field) => {
        var [ok, value] = getChange(field, changeset)
        if (!ok) return changeset

        if (!reserved.some(x => x === value)) return changeset

        return putError(
          field,
          { message, validation: 'exclusion', reserved },
          changeset
        )
      }, changeset)
    },
    inclusion({ message = 'is invalid', fields, include }, changeset) {
      return fields.reduce((changeset, field) => {
        var [ok, value] = getChange(field, changeset)
        if (!ok) return changeset

        if (include.some(x => x === value)) return changeset

        return putError(
          field,
          { message, validation: 'inclusion', include },
          changeset
        )
      }, changeset)
    },
    format({ message = 'has invalid format', fields, match }, changeset) {
      return fields.reduce((changeset, field) => {
        var [ok, value] = getChange(field, changeset)
        if (!ok) return changeset

        if (typeof value !== 'string')
          throw `Invalid type of ${field}. Valid types: string.`

        if (value.match(match)) return changeset
        return putError(
          field,
          { message, validation: 'format', match },
          changeset
        )
      }, changeset)
    },
    lessThan({ message, number, fields }, changeset) {
      message = message || `must be less than ${number}`
      return fields.reduce((changeset, field) => {
        var [ok, value] = getChange(field, changeset)
        if (!ok) return changeset

        return value < number
          ? changeset
          : putError(
              field,
              { message, validation: 'less than', number },
              changeset
            )
      }, changeset)
    },
    greaterThan({ message, number, fields }, changeset) {
      message = message || `must be greater than ${number}`
      return fields.reduce((changeset, field) => {
        var [ok, value] = getChange(field, changeset)
        if (!ok) return changeset

        return value > number
          ? changeset
          : putError(
              field,
              { message, validation: 'greater than', number },
              changeset
            )
      }, changeset)
    },
    lessThanOrEqualTo({ message, number, fields }, changeset) {
      message = message || `must be less than or equal to ${number}`
      return fields.reduce((changeset, field) => {
        var [ok, value] = getChange(field, changeset)
        if (!ok) return changeset

        return value <= number
          ? changeset
          : putError(
              field,
              { message, validation: 'less than or equal to', number },
              changeset
            )
      }, changeset)
    },
    greaterThanOrEqualTo({ message, number, fields }, changeset) {
      message = message || `must be greater than or equal to ${number}`
      return fields.reduce((changeset, field) => {
        var [ok, value] = getChange(field, changeset)
        if (!ok) return changeset

        return value >= number
          ? changeset
          : putError(
              field,
              { message, validation: 'greater than or equal to', number },
              changeset
            )
      }, changeset)
    },
    equalTo({ message, number, fields }, changeset) {
      message = message || `must be equal to ${number}`
      return fields.reduce((changeset, field) => {
        var [ok, value] = getChange(field, changeset)
        if (!ok) return changeset

        return value == number
          ? changeset
          : putError(
              field,
              { message, validation: 'equal to', number },
              changeset
            )
      }, changeset)
    }
  },
  (key, fn) => curry(fn)
)
