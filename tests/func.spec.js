var {
  pick,
  getByPath,
  isUndefined,
  curry,
  mapObj,
  compose,
  pipe
} = require('../lib/func')

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

describe('curry', function() {
  var fn = function(x, y, z) {
    return x + y + z
  }
  it('should curry function params', function() {
    var curried = curry(fn)
    expect(() => curried('x')).not.toThrow()
    expect(() => curried('x', 'y')).not.toThrow()
    expect(() => curried('x', 'y', 'z')).not.toThrow()
    expect(curried('x', 'y', 'z')).toEqual('xyz')
    expect(() => curried('x')('y')).not.toThrow()
    expect(() => curried('x')('y')('z')).not.toThrow()
    expect(curried('x')('y')('z')).toEqual('xyz')
  })
})

describe('mapObj', function() {
  it('should map by object attributes', function() {
    var obj = { a: 'x', b: 'x', c: 'x' }
    expect(mapObj(obj, (key, value) => key + value)).toEqual({
      a: 'ax',
      b: 'bx',
      c: 'cx'
    })
  })
})

var toUpper = x => x.toUpperCase()
var identity = x => x

describe('compose', function() {
  it('should compose functions', function() {
    expect(compose(toUpper, identity)('greetings')).toEqual('GREETINGS')
  })
})

describe('pipe', function() {
  it('should pipe functions', function() {
    expect(pipe(identity, toUpper)('greetings')).toEqual('GREETINGS')
  })
})
