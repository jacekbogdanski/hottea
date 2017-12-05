var { createChangeset } = require('./helpers')
var { cast, getChange, getData, putError, merge } = require('../lib/changeset')

describe('cast', function() {
  it('should give correct changeset', function() {
    expect(cast({ 1: 1, 2: 2 }, { 2: 2, 3: 3 }, ['1', '2'])).toEqual({
      data: { 1: 1, 2: 2 },
      changes: { 2: 2 },
      errors: {},
      valid: true,
      action: null
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
      action: 'UPDATE',
      valid: false
    })
    var changeset2 = createChangeset({
      data,
      changes: { title: 'new title' },
      errors: { rules: ['error'] },
      action: 'INSERT',
      valid: false
    })

    expect(merge(changeset1, changeset2)).toEqual({
      data: { id: 1 },
      changes: { title: 'new title', body: 'body' },
      errors: { rules: ['error'] },
      action: 'INSERT',
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
    var changeset = createChangeset({ changes: { 1: 'change' } })
    expect(getChange('1', changeset)).toEqual('change')
  })

  it('without change should give nothing', function() {
    var changeset = createChangeset()
    expect(getChange('1', changeset)).toEqual(undefined)
  })
})

describe('getData', function() {
  it('with data should give data from changeset', function() {
    var changeset = createChangeset({ data: { 1: 'data' } })
    expect(getData('1', changeset)).toEqual('data')
  })

  it('without data should give nothing', function() {
    var changeset = createChangeset()
    expect(getData('1', changeset)).toEqual(undefined)
  })
})

describe('putError', function() {
  it('should put error into changeset', function() {
    var changeset = createChangeset()
    expect(putError('1', 'error', changeset)).toEqual(
      createChangeset({ errors: { 1: ['error'] }, valid: false })
    )
  })
})
