module.exports = {
  createChangeset(obj) {
    return Object.assign(
      {},
      {
        data: {},
        changes: {},
        errors: {},
        valid: true,
        action: null
      },
      obj
    )
  }
}
