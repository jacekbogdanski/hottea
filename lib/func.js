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
  }
}
