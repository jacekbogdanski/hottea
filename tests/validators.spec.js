var { createChangeset } = require('./helpers')
var {
  required,
  length,
  acceptance,
  change,
  confirmation,
  exclusion
} = require('../lib/validators')

describe('required', function() {
  var errors = ["can't be blank"]

  it('with data should pass', function() {
    var changeset = createChangeset({ data: { 1: 1 } })
    expect(required(['1'], changeset).errors).toEqual({})
  })

  it('with change should pass', function() {
    var changeset = createChangeset({ changes: { 1: 1 } })
    var result = required(['1'], changeset)
    expect(result.valid).toBeTruthy()
    expect(result.errors).toEqual({})
  })

  it('without data and change should give error', function() {
    var changeset = createChangeset()
    var result = required(['1'], changeset)
    expect(result.valid).toBeFalsy()
    expect(result.errors).toEqual({ 1: errors })
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
      required(['1', '2', '3', '4', '5', '6', '7'], changeset).errors
    ).toEqual({ 5: errors, 7: errors })
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
    expect(length(3, 5, ['1'], changeset).errors).toEqual({})
    expect(length(3, 5, ['2'], changeset).errors).toEqual({})
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

    expect(length(3, 3, ['1'], changeset).errors).toEqual({
      1: stringErrors.is(3)
    })

    expect(length(4, 10, ['1'], changeset).errors).toEqual({
      1: stringErrors.min(4)
    })

    expect(length(1, 2, ['1'], changeset).errors).toEqual({
      1: stringErrors.max(2)
    })

    var arrayErrors = {
      is: x => [`should have ${x} items(s)`],
      min: x => [`should have at least ${x} items(s)`],
      max: x => [`should have at most ${x} items(s)`]
    }

    expect(length(3, 3, ['2'], changeset).errors).toEqual({
      2: arrayErrors.is(3)
    })

    expect(length(4, 10, ['2'], changeset).errors).toEqual({
      2: arrayErrors.min(4)
    })

    expect(length(1, 2, ['2'], changeset).errors).toEqual({
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
    expect(acceptance(['1'], changeset).errors).toEqual({})
  })

  it('with falsy change should give errors', function() {
    var changeset = createChangeset({ changes: { 1: false } })
    expect(acceptance(['1'], changeset).errors).toEqual({
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
  it('with empty array from validator should pass', function() {
    var changeset = createChangeset({ changes: { 1: 10 } })
    expect(change(notZero, ['1'], changeset).errors).toEqual({})
  })

  it('with errors from validator should give errors', function() {
    var changeset = createChangeset({ changes: { 1: 0 } })
    expect(change(notZero, ['1'], changeset).errors).toEqual({ 1: ['error'] })
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
    expect(confirmation(['email'], changeset).errors).toEqual({})
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
    expect(confirmation(['email', 'password'], changeset).errors).toEqual({
      email: errors,
      password: errors
    })
  })
})

describe('exclusion', function() {
  var reserved = ['admin', 'superadmin']
  it('when change is not included in given enumerable should pass', function() {
    var changeset = createChangeset({ changes: { name: 'foo' } })
    expect(exclusion(['name'], reserved, changeset).errors).toEqual({})
  })

  it('when change is included in given enumerable should give errors', function() {
    var changeset = createChangeset({ changes: { name: 'admin' } })
    expect(exclusion(['name'], reserved, changeset).errors).toEqual({
      name: ['is reserved']
    })
  })
})
