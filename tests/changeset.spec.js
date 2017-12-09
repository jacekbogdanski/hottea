var {
  cast,
  getChange,
  putChange,
  getField,
  putError,
  getErrors,
  merge,
  castAssoc,
  traverseErrors,
  applyChanges,
  deleteChange,
  applyAction
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
      valid: true,
      action: null
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
  var changeset = cast({ address }, {}, ['line', 'city'])

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
    ).toMatchObject({
      data: { address },
      valid: true,
      changes: {
        address: {
          data: address,
          changes: { line: newAddress.line },
          valid: true
        }
      }
    })

    expect(
      castAssoc(
        { change: changeAddress, field: 'address' },
        { line: newAddress.line, city: null },
        changeset
      )
    ).toMatchObject({
      data: { address },
      valid: false,
      changes: {
        address: {
          data: address,
          changes: { line: newAddress.line, city: null },
          errors: { city: [{ message: 'error', validation: 'required' }] },
          valid: false
        }
      }
    })
  })
})

describe('traverseErrors', function() {
  var changeset = required(
    { fields: ['username'], message: 'required' },
    cast({}, {}, ['username'])
  )
  var changeAddress = (data, attrs) =>
    required(
      { fields: ['line', 'city'], message: 'required' },
      cast(data, attrs, ['line', 'city'])
    )

  changeset = castAssoc(
    { field: 'address', change: changeAddress },
    { line: '123 Main St' },
    changeset
  )

  it('without callback should give errors from changeset and associations', function() {
    expect(traverseErrors(changeset)).toEqual({
      username: ['required'],
      address: { city: ['required'] }
    })
  })

  it('with callback should give formatted errors from changeset and associations', function() {
    expect(
      traverseErrors(changeset, (field, error) => `${field}: ${error.message}`)
    ).toEqual({
      username: ['username: required'],
      address: { city: ['city: required'] }
    })
  })
})

describe('merge', function() {
  it('with same data should merge two changesets', function() {
    var data = { id: 1 }
    var fields = ['title', 'body']

    var changeset1 = required(
      { fields, message: 'required' },
      cast(data, {}, fields)
    )
    var changeset2 = required(
      { fields, message: 'required' },
      cast(data, { title: 'new title' }, fields)
    )
    expect(merge(changeset1, changeset2)).toMatchObject({
      data,
      changes: { title: 'new title', body: null },
      errors: { body: [{ message: 'required' }] },
      valid: false
    })
  })

  it('with different data should throw', function() {
    var changeset1 = cast({ id: 1 }, {}, [])
    var changeset2 = cast({ id: 2 }, {}, [])

    expect(() => merge(changeset1, changeset2)).toThrow()
  })
})

describe('getChange', function() {
  it('with change should give change from changeset', function() {
    var changeset = cast({}, { change: 'change' }, ['change'])
    expect(getChange('change', changeset)).toEqual('change')
  })

  it('without change should give nothing', function() {
    var changeset = cast({}, {}, [])
    expect(getChange('change', changeset)).toEqual(undefined)
  })
})

describe('putChange', function() {
  it('should put change into changeset', function() {
    expect(putChange('title', 'new title', cast({}, {}, []))).toMatchObject({
      changes: { title: 'new title' }
    })

    expect(
      putChange('title', 'new title', cast({}, { title: 'title' }, ['title']))
    ).toMatchObject({ changes: { title: 'new title' } })
  })
})

describe('getField', function() {
  it('with data should give data from changeset', function() {
    expect(getField('data', cast({ data: 'data' }, {}, []))).toEqual('data')
  })

  it('without data should give nothing', function() {
    expect(getField('data', cast({}, {}, []))).toEqual(undefined)
  })
})

describe('getErrors', function() {
  it('with errors should give errors from changeset', function() {
    var changeset = required(
      { fields: ['title'], message: 'required' },
      cast({}, {}, ['title'])
    )
    expect(getErrors('title', changeset)).toEqual([
      { message: 'required', validation: 'required' }
    ])
  })

  it('without errors should give nothing', function() {
    expect(getErrors('title', cast({}, {}, []))).toEqual([])
  })
})

describe('putError', function() {
  it('should put error into changeset', function() {
    var error = { message: 'error', validation: 'test' }
    expect(putError('change', error, cast({}, {}, []))).toMatchObject({
      errors: { change: [error] }
    })
  })
})

describe('applyChanges', function() {
  it('should give data view from changeset and associations', function() {
    var changeset = cast({ id: 1 }, { title: 'title' }, ['title'])
    changeset = castAssoc(
      { field: 'author', change: (data, attrs) => cast(data, attrs, ['name']) },
      { name: 'jacek' },
      changeset
    )

    expect(applyChanges(changeset)).toEqual({
      id: 1,
      title: 'title',
      author: { name: 'jacek' }
    })
  })
})

describe('deleteChange', function() {
  it('with valid change should delete change from changeset', function() {
    var changeset = cast({}, { title: 'title', body: 'body' }, [
      'title',
      'body'
    ])
    expect(deleteChange('title', changeset)).toMatchObject({
      changes: { body: 'body' },
      errors: {}
    })
  })

  it('with invalid change should delete change and error from changeset', function() {
    var changeset = required(
      { fields: ['body'] },
      cast({}, { title: 'title' }, ['title'])
    )
    expect(deleteChange('body', changeset)).toMatchObject({
      changes: { title: 'title' },
      errors: {}
    })
  })
})

describe('applyAction', function() {
  it('with valid changeset should apply changes and action to changeset data', function() {
    var changeset = cast({ id: 1 }, { title: 'title' }, ['title'])
    expect(applyAction(changeset, 'INSERT')).toMatchObject([
      true,
      {
        data: { id: 1, title: 'title' },
        changes: {},
        valid: true,
        action: 'INSERT'
      }
    ])
  })

  it('with invalid changeset should give error result', function() {
    var changeset = required(
      { fields: ['title'] },
      cast({ id: 1 }, {}, ['title'])
    )
    expect(applyAction(changeset, 'INSERT')).toEqual([false, changeset])
  })
})
