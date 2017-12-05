module.exports = {
  pick(attrs, obj) {
    return attrs.reduce((cur, attr) => {
      var val = obj[attr]
      if (val) cur[attr] = val
      return cur
    }, {})
  },
  getByPath(path, obj) {
    return path.reduce((cur, attr) => {
      if (cur && cur.hasOwnProperty(attr)) return cur[attr]
      return undefined
    }, obj)
  },
  isUndefined(x) {
    return x === undefined
  },
  curry(fn) {
    var arity = fn.length
    return (function resolver(...memory) {
      return function(...args) {
        var local = [...memory, ...args]
        var next = local.length >= arity ? fn : resolver
        return next.apply(null, local)
      }
    })()
  },
  mapObj(obj, fn) {
    return Object.keys(obj).reduce((cur, key) => {
      cur[key] = fn(key, obj[key])
      return cur
    }, {})
  },
  compose(...fns) {
    return function(x) {
      return fns.reduceRight((val, fn) => {
        return fn(val)
      }, x)
    }
  },
  pipe(...fns) {
    return function(x) {
      return fns.reduce((val, fn) => {
        return fn(val)
      }, x)
    }
  },
  omit(attrs, obj) {
    var keys = Object.keys(obj),
      keep = keys.filter(key => !attrs.some(attr => attr === key))

    return keep.reduce((cur, attr) => {
      cur[attr] = obj[attr]
      return cur
    }, {})
  },
  isEqual: isEqual
}

function isEqual(left, right) {
  if (left === right) return true
  if (left === null || right === null) return false

  var leftType = typeof left,
    rightType = typeof right

  if (leftType !== rightType) return false
  if (leftType === 'array') return isArrEqual(left, right)
  if (leftType === 'object') return isObjEqual(left, right)

  return false
}

function isArrEqual(left, right) {
  if (left.length == 0 && right.length == 0) return true
  if (left.length != right.length) return false

  for (let i = 0, len = left.length; i < len; i++) {
    if (!isEqual(left[i], right[i])) {
      return false
    }
  }
  return true
}

function isObjEqual(left, right) {
  if (left instanceof RegExp) {
    return right instanceof RegExp
      ? isEqual(String(left), String(right))
      : false
  }

  if (left instanceof Date) {
    return right instanceof Date ? left.getTime() == right.getTime() : false
  }

  var leftKeys = Object.keys(left),
    rightKeys = Object.keys(right)

  if (!isArrEqual(leftKeys, rightKeys)) return false

  for (let i = 0, len = leftKeys.length; i < len; i++) {
    let key = leftKeys[i]
    if (!isEqual(left[key], right[key])) return false
  }
  return true
}
