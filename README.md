Jubjub has been created to separate data management in business and data layers in a functional programming way.
It allows for manipulating, validation and association handling of the business entities and at the same time keeping advantages of data immutability.

Example:

```javascript
// article.js

// using composition
module.exports = {
  change(data, attrs) {
    return compose(
      required({ fields: ['title', 'body'] }),
      length({ fields: ['body'], min: 10, max: 300 }),
      acceptance({ fields: ['rules'] })
    )(cast(data, attrs, ['title', 'body', 'rules']))
  }
}

// or fluent api
module.exports = {
  change(data, attrs) {
    return from(data, attrs, ['title', 'body', 'rules'])
      .required({ fields: ['title', 'body'] })
      .length({ fields: ['body'], min: 10, max: 300 })
      .acceptance({ fields: ['rules'] }).changeset
  }
}

// index.js
var article = require('./article')

var entity = repo.getById(1)
var changeset = article.change(entity, { title: 'new title', rules: false })

equal(changeset, {
  data: entity,
  changes: { title: 'new title', rules: false },
  errors: {
    title: [{ message: "can't be blank", validation: 'required' }],
    rules: [{ message: 'is required', validation: 'acceptance' }]
  },
  valid: false
})
```

See [online documentation](https://jacekbogdanski.github.io/jubjub/) for more.
