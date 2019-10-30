const pkg = require('./package')
const fs = require('fs');
const config = require('./config/db')
const express = require('express')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const index = require('./router/index')
// const movie = require('./api/movie')

mongoose.connect(config.mongodb)
mongoose.Promise = global.Promise

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(favicon(__dirname + '/src/assets/favicon.ico'))
app.use(express.static('dist'))
app.use(express.static(__dirname + "/public"));
app.use('/',index)

// 下载数据集
app.get('/api/download/:name', (req, res) => {
  let filename = req.params.name + '.xlsx';
  let filepath = `${__dirname}/public/${filename}`;
  console.log(filepath, filename);
  res.download(filepath, filename)
  // res.set({
  //   'Content-Type': 'application/octet-stream',
  //   'Content-Disposition': 'attachment; filename=filename.txt',
  //   'Content-Length': 1000
  // });
  // fs.createReadStream(filepath).pipe(res);
})

app.listen(port, () => {
  console.log(`${pkg.name} listening on port ${port}`)
})

module.exports = app
