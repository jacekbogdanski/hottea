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
      message: () => `expected valid to be truthy`
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
  var requiredValidator = required(['1'])

  it('with data should pass', function() {
    var changeset = createChangeset({ data: { 1: 1 } })
    expect(requiredValidator(changeset)).toBeValid()
  })

  it('with change should pass', function() {
    var changeset = createChangeset({ changes: { 1: 1 } })
    expect(requiredValidator(changeset)).toBeValid()
  })

  it('without data and change should give error', function() {
    var changeset = createChangeset()
    expect(requiredValidator(changeset)).toBeInvalid({ 1: errors })
  })

  it('should work with different data sources', function() {
    var changeset = createChangeset({
      data: {
        1: 'string',
        2: 0,
        3: false,
        4: {},
        5: '  ',
        6: null,
        7: undefined
      }
    })
    expect(
      required(['1', '2', '3', '4', '5', '6', '7'], changeset)
    ).toBeInvalid({ 5: errors, 7: errors })
  })
})

describe('length', function() {
  it('with correct change length should pass', function() {
    var changeset = createChangeset({
      changes: {
        1: '123',
        2: [1, 2, 3]
      }
    })
    var lengthValidator = length(3, 5)
    expect(lengthValidator(['1'], changeset)).toBeValid()
    expect(lengthValidator(['2'], changeset)).toBeValid()
  })

  it('with invalid change length should give errors', function() {
    var stringErrors = {
      is: x => [`should be ${x} character(s)`],
      min: x => [`should be at least ${x} character(s)`],
      max: x => [`should be at most ${x} character(s)`]
    }

    var changeset = createChangeset({
      changes: {
        1: '123',
        2: [1, 2, 3]
      }
    })

    expect(length(3, 3, ['1'], changeset)).toBeInvalid({
      1: stringErrors.is(3)
    })

    expect(length(4, 10, ['1'], changeset)).toBeInvalid({
      1: stringErrors.min(4)
    })

    expect(length(1, 2, ['1'], changeset)).toBeInvalid({
      1: stringErrors.max(2)
    })

    var arrayErrors = {
      is: x => [`should have ${x} items(s)`],
      min: x => [`should have at least ${x} items(s)`],
      max: x => [`should have at most ${x} items(s)`]
    }

    expect(length(3, 3, ['2'], changeset)).toBeInvalid({
      2: arrayErrors.is(3)
    })

    expect(length(4, 10, ['2'], changeset)).toBeInvalid({
      2: arrayErrors.min(4)
    })

    expect(length(1, 2, ['2'], changeset)).toBeInvalid({
      2: arrayErrors.max(2)
    })
  })

  it('with invalid change type should throw', function() {
    var changeset = createChangeset({ changes: { 1: 1 } })
    expect(() => length(2, 3, ['1'], changeset)).toThrow()
  })
})

describe('acceptance', function() {
  it('with thruthy change should pass', function() {
    var changeset = createChangeset({ changes: { 1: true } })
    expect(acceptance(['1'], changeset)).toBeValid()
  })

  it('with falsy change should give errors', function() {
    var changeset = createChangeset({ changes: { 1: false } })
    expect(acceptance(['1'], changeset)).toBeInvalid({
      1: ['must be accepted']
    })
  })

  it('with invalid change type should throw', function() {
    var changeset = createChangeset({ changes: { 1: null, 2: 'string', 3: 4 } })
    expect(() => acceptance(['1'], changeset)).toThrow()
    expect(() => acceptance(['2'], changeset)).toThrow()
    expect(() => acceptance(['3'], changeset)).toThrow()
  })
})

describe('change', function() {
  var notZero = x => (x == 0 ? ['error'] : [])
  var changeValidator = change(notZero, ['1'])

  it('with empty array from validator should pass', function() {
    var changeset = createChangeset({ changes: { 1: 10 } })
    expect(changeValidator(changeset)).toBeValid()
  })

  it('with errors from validator should give errors', function() {
    var changeset = createChangeset({ changes: { 1: 0 } })
    expect(changeValidator(changeset)).toBeInvalid({ 1: ['error'] })
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
    expect(confirmation(['email'], changeset)).toBeValid()
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
    expect(confirmation(['email', 'password'], changeset)).toBeInvalid({
      email: errors,
      password: errors
    })
  })
})

describe('exclusion', function() {
  var reserved = ['admin', 'superadmin']
  var exclusionValidator = exclusion(['name'], reserved)

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
})

describe('inclusion', function() {
  var include = ['man', 'woman']
  var inclusionValidator = inclusion(['gender'], include)

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
})

describe('format', function() {
  var regx = /@/
  var formatValidator = format(['email'], regx)
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
})

describe('number', function() {
  var changeset = createChangeset({ changes: { count: 10 } })

  it('when change meet conditions should pass ', function() {
    expect(lessThan(11, ['count'], changeset)).toBeValid()
    expect(greaterThan(9, ['count'], changeset)).toBeValid()
    expect(lessThanOrEqualTo(10, ['count'], changeset)).toBeValid()
    expect(lessThanOrEqualTo(11, ['count'], changeset)).toBeValid()
    expect(greaterThanOrEqualTo(10, ['count'], changeset)).toBeValid()
    expect(greaterThanOrEqualTo(9, ['count'], changeset)).toBeValid()
    expect(equalTo(10, ['count'], changeset)).toBeValid()
  })

  it('when change does not meet conditions should give errors ', function() {
    expect(lessThan(10, ['count'], changeset)).toBeInvalid({
      count: ['must be less than 10']
    })
    expect(greaterThan(10, ['count'], changeset)).toBeInvalid({
      count: ['must be greater than 10']
    })
    expect(lessThanOrEqualTo(9, ['count'], changeset)).toBeInvalid({
      count: ['must be less than or equal to 9']
    })
    expect(greaterThanOrEqualTo(11, ['count'], changeset)).toBeInvalid({
      count: ['must be greater than or equal to 11']
    })
    expect(equalTo(11, ['count'], changeset)).toBeInvalid({
      count: ['must be equal to 11']
    })
  })
})
