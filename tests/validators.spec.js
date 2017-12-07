var { createChangeset } = require('./helpers')

var {
  required,
  length,
  acceptance,
  change,
  confirmation,
  exclusion,
  inclusion,
  format,
  lessThan,
  greaterThan,
  lessThanOrEqualTo,
  greaterThanOrEqualTo,
  equalTo
} = require('../lib/validators')

expect.extend({
  toBeValid(changeset) {
    var noErrors = this.equals(changeset.errors, {})
    var valid = changeset.valid

    if (noErrors && valid) return { pass: true }

    if (!noErrors)
      return {
        pass: false,
        message: () =>
          `expected \n ${this.utils.printReceived(
            changeset.errors
          )}\n\n to be \n${this.utils.printExpected({})}`
      }

    return {
      pass: false,
      message: () => 'expected valid to be truthy'
    }
  },
  toBeInvalid(changeset, errors) {
    var matchErrors = this.equals(changeset.errors, errors)
    var invalid = !changeset.valid

    if (matchErrors && invalid) return { pass: true }

    if (!matchErrors)
      return {
        pass: false,
        message: () =>
          `expected \n${this.utils.printReceived(
            changeset.errors
          )}\n\nto be \n${this.utils.printExpected(errors)}`
      }

    return {
      pass: false,
      message: () => 'expected valid to be falsy'
    }
  }
})

describe('required', function() {
  var errors = ["can't be blank"]
  var requiredValidator = required({ fields: ['username'] })

  it('with data should pass', function() {
    var changeset = createChangeset({ data: { username: 'jacek' } })
    expect(requiredValidator(changeset)).toBeValid()
  })

  it('with change should pass', function() {
    var changeset = createChangeset({ changes: { username: 'jacek' } })
    expect(requiredValidator(changeset)).toBeValid()
  })

  it('without data and change should give error', function() {
    var changeset = createChangeset()
    expect(requiredValidator(changeset)).toBeInvalid({ username: errors })
  })

  it('should work with different data sources', function() {
    var changeset = createChangeset({
      data: {
        string: 'string',
        zero: 0,
        bool: false,
        obj: {},
        emptyString: '  ',
        null: null,
        undefined: undefined
      }
    })
    expect(
      required(
        {
          fields: [
            'string',
            'zero',
            'bool',
            'obj',
            'emptyString',
            'null',
            'undefined'
          ]
        },
        changeset
      )
    ).toBeInvalid({ emptyString: errors, undefined: errors, null: errors })
  })

  it('should allow for custom error message', function() {
    var changeset = createChangeset()
    expect(
      required({ fields: ['email'], message: 'email is required' }, changeset)
    ).toBeInvalid({ email: ['email is required'] })
  })
})

describe('length', function() {
  it('with correct change length should pass', function() {
    var changeset = createChangeset({
      changes: {
        string: '123',
        array: [1, 2, 3]
      }
    })
    expect(
      length({ fields: ['string'], min: 3, max: 5 }, changeset)
    ).toBeValid()
    expect(length({ fields: ['array'], min: 3, max: 5 }, changeset)).toBeValid()
  })

  it('with invalid change length should give errors', function() {
    var stringErrors = {
      is: x => [`should be ${x} character(s)`],
      min: x => [`should be at least ${x} character(s)`],
      max: x => [`should be at most ${x} character(s)`]
    }

    var changeset = createChangeset({
      changes: {
        string: '123',
        array: [1, 2, 3]
      }
    })

    expect(
      length({ fields: ['string'], min: 3, max: 3 }, changeset)
    ).toBeInvalid({
      string: stringErrors.is(3)
    })

    expect(
      length({ fields: ['string'], min: 4, max: 10 }, changeset)
    ).toBeInvalid({
      string: stringErrors.min(4)
    })

    expect(
      length({ fields: ['string'], min: 1, max: 2 }, changeset)
    ).toBeInvalid({
      string: stringErrors.max(2)
    })

    var arrayErrors = {
      is: x => [`should have ${x} items(s)`],
      min: x => [`should have at least ${x} items(s)`],
      max: x => [`should have at most ${x} items(s)`]
    }

    expect(
      length({ fields: ['array'], min: 3, max: 3 }, changeset)
    ).toBeInvalid({
      array: arrayErrors.is(3)
    })

    expect(
      length({ fields: ['array'], min: 4, max: 10 }, changeset)
    ).toBeInvalid({
      array: arrayErrors.min(4)
    })

    expect(
      length({ fields: ['array'], min: 1, max: 2 }, changeset)
    ).toBeInvalid({
      array: arrayErrors.max(2)
    })
  })

  it('with invalid change type should throw', function() {
    var changeset = createChangeset({
      changes: { object: {}, number: 12, regex: /@/ }
    })
    expect(() =>
      length({ fields: ['object'], min: 2, max: 3 }, changeset)
    ).toThrow()
    expect(() =>
      length({ fields: ['number'], min: 2, max: 3 }, changeset)
    ).toThrow()
    expect(() =>
      length({ fields: ['regex'], min: 2, max: 3 }, changeset)
    ).toThrow()
  })

  it('should allow for custom error message', function() {
    var changeset = createChangeset({
      changes: {
        username: 'joe'
      }
    })

    var message = {
      is: x => `is error for ${x}`,
      min: x => `min error for ${x}`,
      max: x => `max error for ${x}`
    }

    expect(
      length(
        { fields: ['username'], min: 3, max: 3, message: message },
        changeset
      )
    ).toBeInvalid({
      username: [message.is(3)]
    })

    expect(
      length(
        { fields: ['username'], min: 4, max: 10, message: message },
        changeset
      )
    ).toBeInvalid({
      username: [message.min(4)]
    })

    expect(
      length(
        { fields: ['username'], min: 1, max: 2, message: message },
        changeset
      )
    ).toBeInvalid({
      username: [message.max(2)]
    })
  })
})

describe('acceptance', function() {
  it('with thruthy change should pass', function() {
    var changeset = createChangeset({ changes: { rules: true } })
    expect(acceptance({ fields: ['rules'] }, changeset)).toBeValid()
  })

  it('with falsy change should give errors', function() {
    var changeset = createChangeset({ changes: { rules: false } })
    expect(acceptance({ fields: ['rules'] }, changeset)).toBeInvalid({
      rules: ['must be accepted']
    })
  })

  it('with invalid change type should throw', function() {
    var changeset = createChangeset({
      changes: { null: null, string: 'string', number: 4, object: {} }
    })
    expect(() => acceptance({ fields: ['null'] }, changeset)).toThrow()
    expect(() => acceptance({ fields: ['string'] }, changeset)).toThrow()
    expect(() => acceptance({ fields: ['number'] }, changeset)).toThrow()
    expect(() => acceptance({ fields: ['object'] }, changeset)).toThrow()
  })

  it('should allow for custom error message', function() {
    var changeset = createChangeset({ changes: { rules: false } })
    expect(
      acceptance({ fields: ['rules'], message: 'accept the rules' }, changeset)
    ).toBeInvalid({
      rules: ['accept the rules']
    })
  })
})

describe('change', function() {
  var notZero = x => (x == 0 ? ['error'] : [])
  var changeValidator = change({ fields: ['count'], validator: notZero })

  it('with empty array from validator should pass', function() {
    var changeset = createChangeset({ changes: { count: 10 } })
    expect(changeValidator(changeset)).toBeValid()
  })

  it('with errors from validator should give errors', function() {
    var changeset = createChangeset({ changes: { count: 0 } })
    expect(changeValidator(changeset)).toBeInvalid({ count: ['error'] })
  })
})

describe('confirmation', function() {
  it('with correct confirmation change will pass', function() {
    var changeset = createChangeset({
      changes: {
        email: 'email@email.com',
        emailConfirmation: 'email@email.com'
      }
    })
    expect(confirmation({ fields: ['email'] }, changeset)).toBeValid()
  })

  it('with invalid confirmation change will give errors', function() {
    var changeset = createChangeset({
      changes: {
        email: 'email@email.com',
        emailConfirmation: 'invalid@email.com',
        password: 'password'
      }
    })
    var errors = ['does not match']
    expect(
      confirmation({ fields: ['email', 'password'] }, changeset)
    ).toBeInvalid({
      email: errors,
      password: errors
    })
  })

  it('should allow for custom error message', function() {
    var changeset = createChangeset({
      changes: {
        password: 'password'
      }
    })
    var message = 'password does not match'

    expect(
      confirmation({ fields: ['password'], message }, changeset)
    ).toBeInvalid({
      password: [message]
    })
  })
})

describe('exclusion', function() {
  var exclusionValidator = exclusion({
    fields: ['name'],
    reserved: ['admin', 'superadmin']
  })

  it('when change is not included in given enumerable should pass', function() {
    var changeset = createChangeset({ changes: { name: 'foo' } })
    expect(exclusionValidator(changeset)).toBeValid()
  })

  it('when change is included in given enumerable should give errors', function() {
    var changeset = createChangeset({ changes: { name: 'admin' } })
    expect(exclusionValidator(changeset)).toBeInvalid({
      name: ['is reserved']
    })
  })

  it('should allow for custom error message', function() {
    var changeset = createChangeset({ changes: { name: 'admin' } })
    var message = 'admin is reserved'
    expect(
      exclusion({ fields: ['name'], reserved: ['admin'], message }, changeset)
    ).toBeInvalid({
      name: [message]
    })
  })
})

describe('inclusion', function() {
  var include = ['man', 'woman']
  var inclusionValidator = inclusion({
    fields: ['gender'],
    include
  })

  it('when change is included in given enumerable should pass', function() {
    var changeset = createChangeset({ changes: { gender: 'man' } })
    expect(inclusionValidator(changeset)).toBeValid()
  })

  it('when change is not included in given enumerable should give errors', function() {
    var changeset = createChangeset({ changes: { gender: 'other' } })
    expect(inclusionValidator(changeset)).toBeInvalid({
      gender: ['is invalid']
    })
  })

  it('when change is not included in given enumerable should give errors', function() {
    var changeset = createChangeset({ changes: { gender: 'other' } })
    var message = 'man or woman'
    expect(
      inclusion({ fields: ['gender'], include, message }, changeset)
    ).toBeInvalid({
      gender: [message]
    })
  })
})

describe('format', function() {
  var opts = { fields: ['email'], match: /@/ }
  var formatValidator = format(opts)

  it('when change is in correct format should pass', function() {
    var changeset = createChangeset({ changes: { email: 'email@email.com' } })
    expect(formatValidator(changeset)).toBeValid()
  })

  it('when change is not in correct format should give errors', function() {
    var changeset = createChangeset({ changes: { email: 'invalid' } })
    expect(formatValidator(changeset)).toBeInvalid({
      email: ['has invalid format']
    })
  })

  it('should allow for custom error message', function() {
    var changeset = createChangeset({ changes: { email: 'invalid' } })
    var message = 'invalid email'
    expect(format(Object.assign({}, opts, { message }), changeset)).toBeInvalid(
      {
        email: [message]
      }
    )
  })
})

describe('number', function() {
  var changeset = createChangeset({ changes: { count: 10 } })

  it('when change meet conditions should pass ', function() {
    expect(lessThan({ fields: ['count'], number: 11 }, changeset)).toBeValid()
    expect(greaterThan({ fields: ['count'], number: 9 }, changeset)).toBeValid()
    expect(
      lessThanOrEqualTo({ fields: ['count'], number: 10 }, changeset)
    ).toBeValid()
    expect(
      lessThanOrEqualTo({ fields: ['count'], number: 11 }, changeset)
    ).toBeValid()
    expect(
      greaterThanOrEqualTo({ fields: ['count'], number: 10 }, changeset)
    ).toBeValid()
    expect(
      greaterThanOrEqualTo({ fields: ['count'], number: 9 }, changeset)
    ).toBeValid()
    expect(equalTo({ fields: ['count'], number: 10 }, changeset)).toBeValid()
  })

  it('when change does not meet conditions should give errors ', function() {
    expect(lessThan({ fields: ['count'], number: 10 }, changeset)).toBeInvalid({
      count: ['must be less than 10']
    })
    expect(
      greaterThan({ fields: ['count'], number: 10 }, changeset)
    ).toBeInvalid({
      count: ['must be greater than 10']
    })
    expect(
      lessThanOrEqualTo({ fields: ['count'], number: 9 }, changeset)
    ).toBeInvalid({
      count: ['must be less than or equal to 9']
    })
    expect(
      greaterThanOrEqualTo({ fields: ['count'], number: 11 }, changeset)
    ).toBeInvalid({
      count: ['must be greater than or equal to 11']
    })
    expect(equalTo({ fields: ['count'], number: 11 }, changeset)).toBeInvalid({
      count: ['must be equal to 11']
    })
  })

  it('should allow for custom error message', function() {
    var message = 'invalid count'
    expect(
      lessThan({ fields: ['count'], number: 10, message }, changeset)
    ).toBeInvalid({
      count: [message]
    })
    expect(
      greaterThan({ fields: ['count'], number: 10, message }, changeset)
    ).toBeInvalid({
      count: [message]
    })
    expect(
      lessThanOrEqualTo({ fields: ['count'], number: 9, message }, changeset)
    ).toBeInvalid({
      count: [message]
    })
    expect(
      greaterThanOrEqualTo(
        { fields: ['count'], number: 11, message },
        changeset
      )
    ).toBeInvalid({
      count: [message]
    })
    expect(
      equalTo({ fields: ['count'], number: 11, message }, changeset)
    ).toBeInvalid({
      count: [message]
    })
  })
})
