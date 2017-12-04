module.exports = {
  pick(obj, attrs) {
    return attrs.reduce((cur, attr) => {
      var val = obj[attr]
      if (val) cur[attr] = val
      return cur
    }, {})
  }
}
