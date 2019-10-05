const mongoose = require('mongoose')

const recordSchema = mongoose.Schema({
  name: {
    type: String
  },
  age: {
    type: Number
  },
  major: {
    type: String
  }
})

const Record = module.exports = mongoose.model('Record',recordSchema)
