var { pick, getByPath, isUndefined } = require('../lib/func')

describe('pick', function() {
  it('should pick expected attributes', function() {
    var stub = { 1: 1, 2: 2, 3: 3 }
    var result = pick(['1', '3', '5'], stub)
    expect(result).toEqual({ 1: 1, 3: 3 })
  })
})

describe('getByPath', function() {
  var obj = { 1: { 2: { 3: 'value' } } }
  it('with correct path should give value', function() {
    expect(getByPath(['1', '2', '3'], obj)).toEqual('value')
  })

  it('with invalid path should give undefined', function() {
    expect(getByPath(['2', '3'], obj)).toEqual(undefined)
  })
})

describe('isUndefined', function() {
  it('with undefined gives thruthy', function() {
    expect(isUndefined(undefined)).toBeTruthy()
  })

  it('without undefined gives falsy', function() {
    expect(isUndefined(null)).toBeFalsy()
    expect(isUndefined('string')).toBeFalsy()
    expect(isUndefined(10)).toBeFalsy()
  })
})
