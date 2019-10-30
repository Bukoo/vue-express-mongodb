const mongoose = require('mongoose')

// ====================== 二级 Schema ======================
// 单个实验任务的数据记录
const TaskRecordSchema = mongoose.Schema({
  // startTime: Date,
  // endTime: Date,
  duration: Number,
  clickCount: Number,
  answer: String
})

const TaskRecord = mongoose.model('TaskRecord', TaskRecordSchema)

// ====================== 一级 Schema ======================

// 个人实验数据记录
const RecordSchema = mongoose.Schema({
  name: String,
  age: Number,
  major: String,
  wholeRecord: {
    clickCount: Number,
    duration: Number
  },
  taskRecords: [TaskRecordSchema]
})

// 实验数据集维度信息
const TableInfoSchema = mongoose.Schema({
  name: String,  // table name
  topic: String,  // table data topic
  cates: Array,  // 类别维 + 时间维
  vals: Array,  // 指标维
  mapping: Object
})

// 实验任务信息
const TaskSchema = mongoose.Schema({
  name: String,
  topic: String,
  questions: [String]
})

const Record = mongoose.model('Record',RecordSchema, 'record')
const TableInfo = mongoose.model('TableInfo', TableInfoSchema, 'table_info')
const Task = mongoose.model('Task', TaskSchema, 'task')

module.exports = { Record, TableInfo, Task }
