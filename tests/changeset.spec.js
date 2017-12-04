var { cast } = require('../lib/changeset')

describe('cast', function() {
  it('with data should give correct changeset', function() {
    expect(cast({ 1: 1, 2: 2 }, { 2: 2, 3: 3 }, ['1', '2'])).toEqual({
      data: { 1: 1, 2: 2 },
      changes: { 2: 2 },
      errors: {},
      valid: true,
      action: null
    })
  })

  it('with changeset should give merged changeset', function() {
    var changeset = {
      data: { 1: 1 },
      changes: { 2: 2 },
      errors: { 2: ['error'] },
      valid: false,
      action: 'INSERT'
    }

    expect(cast(changeset, { 3: 3 }, ['2', '3'])).toEqual({
      data: { 1: 1 },
      changes: { 2: 2, 3: 3 },
      errors: {},
      valid: true,
      action: 'INSERT'
    })
  })
})
