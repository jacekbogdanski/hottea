var { cast } = require('../lib/changeset')

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
  var errors = [{ message: "can't be blank", validation: 'required' }]
  var requiredValidator = required({ fields: ['username'] })

  it('with data should pass', function() {
    var changeset = cast({ username: 'jacek' }, {}, [])
    expect(requiredValidator(changeset)).toBeValid()
  })

  it('with change should pass', function() {
    var changeset = cast({}, { username: 'jacek' }, ['username'])
    expect(requiredValidator(changeset)).toBeValid()
  })

  it('without data and change should give error', function() {
    var changeset = cast({}, {}, ['username'])
    expect(requiredValidator(changeset)).toBeInvalid({ username: errors })
  })

  it('should work with different data sources', function() {
    var fields = [
      'string',
      'zero',
      'bool',
      'obj',
      'emptyString',
      'null',
      'undefined'
    ]

    var changeset = cast(
      {},
      {
        string: 'string',
        zero: 0,
        bool: false,
        obj: {},
        emptyString: '  ',
        null: null,
        undefined: undefined
      },
      fields
    )
    expect(
      required(
        {
          fields
        },
        changeset
      )
    ).toBeInvalid({ emptyString: errors, undefined: errors, null: errors })
  })

  it('should allow for custom error message', function() {
    var changeset = cast({}, {}, [])
    var message = 'email is required'
    expect(required({ fields: ['email'], message }, changeset)).toBeInvalid({
      email: [{ message, validation: 'required' }]
    })
  })
})

describe('length', function() {
  var changeset = cast(
    {},
    {
      string: '123',
      array: [1, 2, 3]
    },
    ['string', 'array']
  )

  it('with correct change length should pass', function() {
    expect(
      length({ fields: ['string'], min: 3, max: 5 }, changeset)
    ).toBeValid()
    expect(length({ fields: ['array'], min: 3, max: 5 }, changeset)).toBeValid()
  })

  it('with invalid change length should give errors', function() {
    expect(
      length({ fields: ['string'], min: 3, max: 3 }, changeset)
    ).toBeInvalid({
      string: [
        {
          message: 'should be 3 character(s)',
          validation: 'length',
          min: 3,
          max: 3
        }
      ]
    })

    expect(
      length({ fields: ['string'], min: 4, max: 10 }, changeset)
    ).toBeInvalid({
      string: [
        {
          message: 'should be at least 4 character(s)',
          validation: 'length',
          min: 4,
          max: 10
        }
      ]
    })

    expect(
      length({ fields: ['string'], min: 1, max: 2 }, changeset)
    ).toBeInvalid({
      string: [
        {
          message: 'should be at most 2 character(s)',
          validation: 'length',
          min: 1,
          max: 2
        }
      ]
    })

    expect(
      length({ fields: ['array'], min: 3, max: 3 }, changeset)
    ).toBeInvalid({
      array: [
        {
          message: 'should have 3 items(s)',
          validation: 'length',
          min: 3,
          max: 3
        }
      ]
    })

    expect(
      length({ fields: ['array'], min: 4, max: 10 }, changeset)
    ).toBeInvalid({
      array: [
        {
          message: 'should have at least 4 items(s)',
          validation: 'length',
          min: 4,
          max: 10
        }
      ]
    })

    expect(
      length({ fields: ['array'], min: 1, max: 2 }, changeset)
    ).toBeInvalid({
      array: [
        {
          message: 'should have at most 2 items(s)',
          validation: 'length',
          min: 1,
          max: 2
        }
      ]
    })
  })

  it('with invalid change type should throw', function() {
    var changeset = cast({}, { object: {}, number: 12, regex: /@/ }, [
      'object',
      'number',
      'regex'
    ])
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
    var changeset = cast({}, { username: 'joe' }, ['username'])
    var message = 'error'
    expect(
      length(
        { fields: ['username'], min: 3, max: 3, message: message },
        changeset
      )
    ).toBeInvalid({
      username: [{ message, validation: 'length', min: 3, max: 3 }]
    })
  })
})

describe('acceptance', function() {
  it('with thruthy change should pass', function() {
    var changeset = cast({}, { rules: true }, ['rules'])
    expect(acceptance({ fields: ['rules'] }, changeset)).toBeValid()
  })

  it('with falsy change should give errors', function() {
    var changeset = cast({}, { rules: false }, ['rules'])
    expect(acceptance({ fields: ['rules'] }, changeset)).toBeInvalid({
      rules: [{ message: 'must be accepted', validation: 'acceptance' }]
    })
  })

  it('with invalid change type should throw', function() {
    var changeset = cast(
      {},
      { null: null, string: 'string', number: 4, object: {} },
      ['null', 'string', 'number', 'object']
    )
    expect(() => acceptance({ fields: ['null'] }, changeset)).toThrow()
    expect(() => acceptance({ fields: ['string'] }, changeset)).toThrow()
    expect(() => acceptance({ fields: ['number'] }, changeset)).toThrow()
    expect(() => acceptance({ fields: ['object'] }, changeset)).toThrow()
  })

  it('should allow for custom error message', function() {
    var changeset = cast({}, { rules: false }, ['rules'])
    var message = 'accept the rules'
    expect(acceptance({ fields: ['rules'], message }, changeset)).toBeInvalid({
      rules: [{ message, validation: 'acceptance' }]
    })
  })
})

describe('change', function() {
  var errors = [{ message: 'not zero', validation: 'not zero' }]
  var notZero = x => (x == 0 ? errors : [])
  var changeValidator = change({ fields: ['count'], validator: notZero })

  it('with empty array from validator should pass', function() {
    var changeset = cast({}, { count: 10 }, ['count'])
    expect(changeValidator(changeset)).toBeValid()
  })

  it('with errors from validator should give errors', function() {
    var changeset = cast({}, { count: 0 }, ['count'])
    expect(changeValidator(changeset)).toBeInvalid({ count: errors })
  })
})

describe('confirmation', function() {
  it('with correct confirmation change will pass', function() {
    var changeset = cast(
      {},
      {
        email: 'email@email.com',
        emailConfirmation: 'email@email.com'
      },
      ['email', 'emailConfirmation']
    )
    expect(confirmation({ fields: ['email'] }, changeset)).toBeValid()
  })

  it('with invalid confirmation change will give errors', function() {
    var changeset = cast(
      {},
      {
        email: 'email@email.com',
        emailConfirmation: 'invalid@email.com',
        password: 'password'
      },
      ['email', 'emailConfirmation', 'password']
    )

    expect(
      confirmation({ fields: ['email', 'password'] }, changeset)
    ).toBeInvalid({
      email: [
        {
          message: 'does not match',
          validation: 'confirmation',
          confirmation: 'invalid@email.com'
        }
      ],
      password: [
        {
          message: 'does not match',
          validation: 'confirmation',
          confirmation: null
        }
      ]
    })
  })

  it('should allow for custom error message', function() {
    var changeset = cast({}, { password: 'password' }, ['password'])
    var message = 'password does not match'

    expect(
      confirmation({ fields: ['password'], message }, changeset)
    ).toBeInvalid({
      password: [{ message, validation: 'confirmation', confirmation: null }]
    })
  })
})

describe('exclusion', function() {
  var reserved = ['admin', 'superadmin']
  var exclusionValidator = exclusion({
    fields: ['name'],
    reserved
  })

  it('when change is not included in given enumerable should pass', function() {
    var changeset = cast({}, { name: 'foo' }, ['name'])
    expect(exclusionValidator(changeset)).toBeValid()
  })

  it('when change is included in given enumerable should give errors', function() {
    var changeset = cast({}, { name: 'admin' }, ['name'])
    expect(exclusionValidator(changeset)).toBeInvalid({
      name: [{ message: 'is reserved', validation: 'exclusion', reserved }]
    })
  })

  it('should allow for custom error message', function() {
    var changeset = cast({}, { name: 'admin' }, ['name'])
    var message = 'admin is reserved'
    expect(
      exclusion({ fields: ['name'], reserved, message }, changeset)
    ).toBeInvalid({
      name: [{ message, validation: 'exclusion', reserved }]
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
    var changeset = cast({}, { gender: 'man' }, ['gender'])
    expect(inclusionValidator(changeset)).toBeValid()
  })

  it('when change is not included in given enumerable should give errors', function() {
    var changeset = cast({}, { gender: 'other' }, ['gender'])
    expect(inclusionValidator(changeset)).toBeInvalid({
      gender: [{ message: 'is invalid', validation: 'inclusion', include }]
    })
  })

  it('when change is not included in given enumerable should give errors', function() {
    var changeset = cast({}, { gender: 'other' }, ['gender'])
    var message = 'man or woman'
    expect(
      inclusion({ fields: ['gender'], include, message }, changeset)
    ).toBeInvalid({
      gender: [{ message, validation: 'inclusion', include }]
    })
  })
})

describe('format', function() {
  var match = /@/
  var opts = { fields: ['email'], match }
  var formatValidator = format(opts)

  it('when change is in correct format should pass', function() {
    var changeset = cast({}, { email: 'email@email.com' }, ['email'])
    expect(formatValidator(changeset)).toBeValid()
  })

  it('when change is not in correct format should give errors', function() {
    var changeset = cast({}, { email: 'invalid' }, ['email'])
    expect(formatValidator(changeset)).toBeInvalid({
      email: [{ message: 'has invalid format', validation: 'format', match }]
    })
  })

  it('should allow for custom error message', function() {
    var changeset = cast({}, { email: 'invalid' }, ['email'])
    var message = 'invalid email'
    expect(format(Object.assign({}, opts, { message }), changeset)).toBeInvalid(
      {
        email: [{ message, validation: 'format', match }]
      }
    )
  })
})

describe('number', function() {
  var changeset = cast({}, { count: 10 }, ['count'])

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
      count: [
        { message: 'must be less than 10', validation: 'less than', number: 10 }
      ]
    })
    expect(
      greaterThan({ fields: ['count'], number: 10 }, changeset)
    ).toBeInvalid({
      count: [
        {
          message: 'must be greater than 10',
          validation: 'greater than',
          number: 10
        }
      ]
    })
    expect(
      lessThanOrEqualTo({ fields: ['count'], number: 9 }, changeset)
    ).toBeInvalid({
      count: [
        {
          message: 'must be less than or equal to 9',
          validation: 'less than or equal to',
          number: 9
        }
      ]
    })
    expect(
      greaterThanOrEqualTo({ fields: ['count'], number: 11 }, changeset)
    ).toBeInvalid({
      count: [
        {
          message: 'must be greater than or equal to 11',
          validation: 'greater than or equal to',
          number: 11
        }
      ]
    })
    expect(equalTo({ fields: ['count'], number: 11 }, changeset)).toBeInvalid({
      count: [
        { message: 'must be equal to 11', validation: 'equal to', number: 11 }
      ]
    })
  })

  it('should allow for custom error message', function() {
    var message = 'invalid count'
    expect(
      lessThan({ fields: ['count'], number: 10, message }, changeset)
    ).toBeInvalid({
      count: [{ message, validation: 'less than', number: 10 }]
    })
    expect(
      greaterThan({ fields: ['count'], number: 10, message }, changeset)
    ).toBeInvalid({
      count: [{ message, validation: 'greater than', number: 10 }]
    })
    expect(
      lessThanOrEqualTo({ fields: ['count'], number: 9, message }, changeset)
    ).toBeInvalid({
      count: [{ message, validation: 'less than or equal to', number: 9 }]
    })
    expect(
      greaterThanOrEqualTo(
        { fields: ['count'], number: 11, message },
        changeset
      )
    ).toBeInvalid({
      count: [{ message, validation: 'greater than or equal to', number: 11 }]
    })
    expect(
      equalTo({ fields: ['count'], number: 11, message }, changeset)
    ).toBeInvalid({
      count: [{ message, validation: 'equal to', number: 11 }]
    })
  })
})
