module.exports = {
  createChangeset(obj) {
    return Object.assign(
      {},
      {
        data: {},
        changes: {},
        errors: {},
        valid: true
      },
      obj
    )
  }
}
