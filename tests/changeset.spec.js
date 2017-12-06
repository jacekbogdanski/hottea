var { createChangeset } = require('./helpers')
var { cast, getChange, getData, putError, merge } = require('../lib/changeset')

describe('cast', function() {
  it('should give correct changeset', function() {
    expect(
      cast(
        { username: 'jacek', email: 'old@email.com' },
        { email: 'new@email.com', invalid: 'invalid' },
        ['username', 'email']
      )
    ).toEqual({
      data: { username: 'jacek', email: 'old@email.com' },
      changes: { email: 'new@email.com' },
      errors: {},
      valid: true
    })
  })
})

describe('merge', function() {
  it('with same data should merge two changesets', function() {
    var data = { id: 1 }
    var changeset1 = createChangeset({
      data,
      changes: { title: 'title', body: 'body' },
      errors: { title: ['too short'], rules: ['error'] },
      valid: false
    })
    var changeset2 = createChangeset({
      data,
      changes: { title: 'new title' },
      errors: { rules: ['error'] },
      valid: false
    })

    expect(merge(changeset1, changeset2)).toEqual({
      data: { id: 1 },
      changes: { title: 'new title', body: 'body' },
      errors: { rules: ['error'] },
      valid: false
    })
  })

  it('with different data should throw', function() {
    var changeset1 = createChangeset({ data: { id: 1 } })
    var changeset2 = createChangeset({ data: { id: 2 } })

    expect(() => merge(changeset1, changeset2)).toThrow()
  })
})

describe('getChange', function() {
  it('with change should give change from changeset', function() {
    var changeset = createChangeset({ changes: { change: 'change' } })
    expect(getChange('change', changeset)).toEqual('change')
  })

  it('without change should give nothing', function() {
    var changeset = createChangeset()
    expect(getChange('change', changeset)).toEqual(undefined)
  })
})

describe('getData', function() {
  it('with data should give data from changeset', function() {
    var changeset = createChangeset({ data: { data: 'data' } })
    expect(getData('data', changeset)).toEqual('data')
  })

  it('without data should give nothing', function() {
    var changeset = createChangeset()
    expect(getData('data', changeset)).toEqual(undefined)
  })
})

describe('putError', function() {
  it('should put error into changeset', function() {
    var changeset = createChangeset()
    expect(putError('change', 'error', changeset)).toEqual(
      createChangeset({ errors: { change: ['error'] }, valid: false })
    )
  })
})
