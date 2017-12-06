var {
  pick,
  getByPath,
  isUndefined,
  curry,
  mapObj,
  compose,
  pipe,
  isEqual,
  omit
} = require('../lib/utils')

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

describe('isEqual', function() {
  it('when values are equal should give truthy', function() {
    expect(isEqual(new Date('2017-01-01'), new Date('2017-01-01'))).toBeTruthy()
    expect(isEqual(0, 0)).toBeTruthy()
    expect(isEqual(/@/, /@/)).toBeTruthy()
    expect(isEqual(null, null)).toBeTruthy()
    expect(isEqual(undefined, undefined)).toBeTruthy()
    expect(isEqual(1, 1)).toBeTruthy()
    expect(isEqual('', '')).toBeTruthy()
    expect(isEqual('str', 'str')).toBeTruthy()
    expect(isEqual([], [])).toBeTruthy()
    expect(isEqual([1, 2, 3], [1, 2, 3])).toBeTruthy()
    expect(isEqual({}, {})).toBeTruthy()
    expect(isEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBeTruthy()
  })

  it('when values are equal should give falsy', function() {
    expect(isEqual(new Date('2017-01-01'), new Date('2017-01-02'))).toBeFalsy()
    expect(isEqual(0, 1)).toBeFalsy()
    expect(isEqual(/@/, /,/)).toBeFalsy()
    expect(isEqual(/@/, {})).toBeFalsy()
    expect(isEqual(null, {})).toBeFalsy()
    expect(isEqual('str', [1])).toBeFalsy()
    expect(isEqual('', 'str')).toBeFalsy()
    expect(isEqual([], [1])).toBeFalsy()
    expect(isEqual([1, 2, 3], [3, 2, 1])).toBeFalsy()
    expect(isEqual({ a: 1, b: { c: 3 } }, { a: 1, b: { c: 2 } })).toBeFalsy()
  })
})

describe('omit', function() {
  it('should omit expected attributes', function() {
    var stub = { 1: 1, 2: 2, 3: 3, 4: 4 }
    var result = omit(['2', '3', '5'], stub)
    expect(result).toEqual({ 1: 1, 4: 4 })
  })
})
