var { createChangeset } = require('./helpers')
var { required } = require('../lib/validators')

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
