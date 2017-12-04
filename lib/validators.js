var { getChange, getData, putError } = require('./changeset')

module.exports = {
  required(params, changeset) {
    var valid = attr =>
      (typeof attr === 'string' && !/^\s*$/.test(attr)) ||
      typeof attr === 'number' ||
      typeof attr === 'boolean' ||
      typeof attr === 'object'

    return params.reduce((changeset, param) => {
      var value = getChange(param, changeset) || getData(param, changeset)
      return value !== undefined && valid(value)
        ? changeset
        : putError(param, "can't be blank", changeset)
    }, changeset)
  }
}
