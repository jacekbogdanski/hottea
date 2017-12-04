var { pick, getByPath } = require('../lib/func')

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
