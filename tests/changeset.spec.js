var { createChangeset } = require('./helpers')
var { cast, getChange, getData, putError } = require('../lib/changeset')

describe('cast', function() {
  it('with data should give correct changeset', function() {
    expect(cast({ 1: 1, 2: 2 }, { 2: 2, 3: 3 }, ['1', '2'])).toEqual({
      data: { 1: 1, 2: 2 },
      changes: { 2: 2 },
      errors: {},
      valid: true,
      action: null
    })
  })

  it('with changeset should give merged changeset', function() {
    var changeset = createChangeset({
      data: { 1: 1 },
      changes: { 2: 2 },
      errors: { 2: ['error'] },
      valid: false,
      action: 'INSERT'
    })

    expect(cast(changeset, { 3: 3 }, ['2', '3'])).toEqual({
      data: { 1: 1 },
      changes: { 2: 2, 3: 3 },
      errors: {},
      valid: true,
      action: 'INSERT'
    })
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
