var { createChangeset } = require('./helpers')
var {
  cast,
  getChange,
  putChange,
  getData,
  putError,
  getErrors,
  merge,
  view,
  castAssoc,
  traverseErrors
} = require('../lib/changeset')

var { required } = require('../lib/validators')

describe('cast', function() {
  it('should give correct changeset', function() {
    expect(
      cast(
        { username: 'jacek', email: 'old@email.com' },
        { email: 'new@email.com', invalid: 'invalid' },
        ['username', 'email']
      )
    ).toEqual({
      data: { username: 'jacek', email: 'old@email.com' },
      changes: { email: 'new@email.com' },
      errors: {},
      valid: true
    })
  })
})

describe('castAssoc', function() {
  var changeAddress = function(data, attrs) {
    var fields = ['line', 'city']
    return required({ fields, message: 'error' }, cast(data, attrs, fields))
  }
  var address = { line: '123 Main St', city: 'New York' }
  var newAddress = { line: '456 Main St', city: 'New York' }
  var changeset = createChangeset({ data: { address } })

  it('should give correct changeset', function() {
    expect(
      castAssoc({ change: changeAddress, field: 'address' }, {}, changeset)
    ).toEqual(changeset)

    expect(
      castAssoc(
        { change: changeAddress, field: 'address' },
        newAddress,
        changeset
      )
    ).toEqual(
      createChangeset({
        data: { address },
        changes: {
          address: createChangeset({
            data: address,
            changes: { line: newAddress.line }
          })
        }
      })
    )

    expect(
      castAssoc(
        { change: changeAddress, field: 'address' },
        { line: newAddress.line, city: null },
        changeset
      )
    ).toEqual(
      createChangeset({
        data: { address },
        valid: false,
        changes: {
          address: createChangeset({
            data: address,
            changes: { line: newAddress.line, city: null },
            errors: { city: [{ message: 'error', validation: 'required' }] },
            valid: false
          })
        }
      })
    )
  })
})

describe('traverseErrors', function() {
  var changeset = createChangeset({
    errors: { username: ['required'] },
    valid: false,
    changes: {
      username: null,
      address: createChangeset({
        changes: { city: 'n' },
        errors: { city: ['too short'] },
        valid: false
      })
    }
  })

  it('without callback should give errors from changeset and associations', function() {
    expect(traverseErrors(changeset)).toEqual({
      username: ['required'],
      address: { city: ['too short'] }
    })
  })

  it('with callback should give formatted errors from changeset and associations', function() {
    expect(
      traverseErrors(changeset, (field, error) => `${field}: ${error}`)
    ).toEqual({
      username: ['username: required'],
      address: { city: ['city: too short'] }
    })
  })
})

describe('merge', function() {
  it('with same data should merge two changesets', function() {
    var data = { id: 1 }
    var changeset1 = createChangeset({
      data,
      changes: { title: 'title', body: 'body' },
      errors: { title: ['too short'], rules: ['error'] },
      valid: false
    })
    var changeset2 = createChangeset({
      data,
      changes: { title: 'new title' },
      errors: { rules: ['error'] },
      valid: false
    })

    expect(merge(changeset1, changeset2)).toEqual({
      data: { id: 1 },
      changes: { title: 'new title', body: 'body' },
      errors: { rules: ['error'] },
      valid: false
    })
  })

  it('with different data should throw', function() {
    var changeset1 = createChangeset({ data: { id: 1 } })
    var changeset2 = createChangeset({ data: { id: 2 } })

    expect(() => merge(changeset1, changeset2)).toThrow()
  })
})

describe('getChange', function() {
  it('with change should give change from changeset', function() {
    var changeset = createChangeset({ changes: { change: 'change' } })
    expect(getChange('change', changeset)).toEqual('change')
  })

  it('without change should give nothing', function() {
    var changeset = createChangeset()
    expect(getChange('change', changeset)).toEqual(undefined)
  })
})

describe('putChange', function() {
  it('should put change into changeset', function() {
    expect(
      putChange(
        'title',
        'new title',
        createChangeset({ changes: { body: 'body' } })
      )
    ).toEqual(
      createChangeset({ changes: { title: 'new title', body: 'body' } })
    )

    expect(
      putChange(
        'title',
        'new title',
        createChangeset({ changes: { title: 'title' } })
      )
    ).toEqual(createChangeset({ changes: { title: 'new title' } }))
  })
})

describe('getData', function() {
  it('with data should give data from changeset', function() {
    var changeset = createChangeset({ data: { data: 'data' } })
    expect(getData('data', changeset)).toEqual('data')
  })

  it('without data should give nothing', function() {
    var changeset = createChangeset()
    expect(getData('data', changeset)).toEqual(undefined)
  })
})

describe('getErrors', function() {
  it('with errors should give errors from changeset', function() {
    var changeset = createChangeset({ errors: { title: ['invalid'] } })
    expect(getErrors('title', changeset)).toEqual(['invalid'])
  })

  it('without errors should give nothing', function() {
    var changeset = createChangeset()
    expect(getErrors('title', changeset)).toEqual([])
  })
})

describe('putError', function() {
  it('should put error into changeset', function() {
    var changeset = createChangeset()
    var error = { message: 'error', validation: 'test' }
    expect(putError('change', error, changeset)).toEqual(
      createChangeset({ errors: { change: [error] }, valid: false })
    )
  })
})

describe('view', function() {
  it('should give correct changeset view', function() {
    expect(
      view(
        createChangeset({
          data: { id: 1, title: 'old title' },
          changes: { title: 'new title' },
          errors: {}
        })
      )
    ).toEqual({
      id: { value: 1, errors: [] },
      title: { value: 'new title', errors: [] },
      __valid__: true
    })

    expect(
      view(
        createChangeset({
          data: { id: 1, title: 'old title', author: 'jacek' },
          changes: { title: 'new title' },
          errors: { body: ['is required'] },
          valid: false
        })
      )
    ).toEqual({
      id: { value: 1, errors: [] },
      title: { value: 'new title', errors: [] },
      body: { value: null, errors: ['is required'] },
      author: { value: 'jacek', errors: [] },
      __valid__: false
    })

    expect(
      view(
        createChangeset({
          data: { id: 1, title: 'title' },
          changes: { body: 'body' },
          errors: {}
        }),
        ['title', 'body']
      )
    ).toEqual({
      title: { value: 'title', errors: [] },
      body: { value: 'body', errors: [] },
      __valid__: true
    })

    expect(
      view(
        createChangeset({
          data: { id: 1, title: 'old title' },
          changes: { title: 'new title', body: 'body' },
          errors: { body: ['too short'] },
          valid: false
        }),
        ['title']
      )
    ).toEqual({
      title: { value: 'new title', errors: [] },
      __valid__: false
    })
  })
})
