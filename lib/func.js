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
  }
}
