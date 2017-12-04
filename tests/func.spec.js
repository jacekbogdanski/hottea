var func = require('../lib/func')

describe('pick', function() {
  it('should pick expected attributes', function() {
    var stub = { 1: 1, 2: 2, 3: 3 }
    var result = func.pick(['1', '3', '5'], stub)
    expect(result).toEqual({ 1: 1, 3: 3 })
  })
})
