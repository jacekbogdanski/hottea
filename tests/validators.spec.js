var { createChangeset } = require('./helpers')
var { required } = require('../lib/validators')

describe('required', function() {
  it('with data should pass', function() {
    var changeset = createChangeset({ data: { 1: 1 } })
    expect(required(['1'], changeset).errors).toEqual({})
  })

  it('with change should pass', function() {
    var changeset = createChangeset({ changes: { 1: 1 } })
    expect(required(['1'], changeset).errors).toEqual({})
  })

  it('without data and change should give error', function() {
    var changeset = createChangeset()
    expect(required(['1'], changeset).errors).toEqual({ 1: ["can't be blank"] })
  })
})
