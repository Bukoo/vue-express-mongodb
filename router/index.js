const express = require('express')
const router = express.Router()

const Record = require('../model')

// 提交个人信息
router.post('/api/record', (req, res) => {
  Record.create(req.body, (err, result) => {
    if (err) {
      res.json(err)
    } else {
      res.json(result)
    }
  })
})
module.exports = router;
