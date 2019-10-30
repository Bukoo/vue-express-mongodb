const express = require('express')
const router = express.Router()
const { Record, Task, TableInfo } = require('../model')

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

// 更新实验任务信息
router.post('/api/record/:userId', (req, res) => {
  let params = req.params;
  let body = req.body;
  console.log('更新实验数据：', body, params.userId)
  Record.findByIdAndUpdate(params.userId,
  { 
    '$push': { taskRecords: body }
  },
  { new: true },
  (err, result) => {
    if (err) {
      res.json(err)
    } else {
      res.json(result)
    }
  })
})

// 结束实验
router.post('/api/experiment/:userId', (req, res) => {
  let params = req.params;
  let body = req.body;
  console.log('结束实验：', body)
  Record.findByIdAndUpdate(params.userId,
  {
    '$set': { 'wholeRecord': body.wholeRecord },
    '$push': { 'taskRecords': body.taskRecord }
  },
  { new: true },
  (err, result) => {
    if (err) {
      res.json(err)
    } else {
      res.json(result)
    }
  })
})

// 获取全部 dataset 信息
router.get('/api/dataset', (req, res) => {
  TableInfo.find({}, (err, result) => {
    if (err) {
      res.json(err)
    } else {
      res.json(result)
    }
  })
})
// 获取某个数据集信息
router.get('/api/dataset/:topic', (req, res) => {
  let topic = req.params.topic;
  TableInfo.find({ topic }, (err, result) => {
    if (err) {
      res.json(err)
    } else {
      res.json(result)
    }
  })
})

// 获取实验任务信息
router.get('/api/task/:topic', (req, res) => {
  let topic = req.params.topic;
  Task.find({ topic }, (err, result) => {
    if (err) {
      res.json(err)
    } else {
      res.json(result)
    }
  })
})


module.exports = router;