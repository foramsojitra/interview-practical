var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
const bluebird = require('bluebird')
mongoose.Promise = bluebird;
var app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//middleware function
var myLogger = (req, res, next) => {
  console.log('LOGGED')
  req.requestTime = Date.now();
  next()
}
app.use(myLogger)

mongoose.connect('mongodb://localhost:27017/pagination', { useMongoClient: true })

var mainRoutes = require('./routes/main')
app.use(mainRoutes)

app.set('view engine', 'ejs')

app.listen(3000, function() {
    console.log('Runing on port ' + 3000)
})