let express = require('express');
let multer = require('multer'),
  bodyParser = require('body-parser'),
  path = require('path');
let mongoose = require('mongoose');
let User = require('./models/User');
let fs = require('fs');
let dir = './uploads';
let csv = require('csv-parser');
mongoose.connect('mongodb://localhost/userdb');
let request = require('request');
let moment = require('moment');

let upload = multer({
  storage: multer.diskStorage({

    destination: (req, file, callback) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      callback(null, './uploads');
    },
    filename: (req, file, callback) => { callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); }

  }),

  fileFilter: (req, file, callback) => {
    let ext = path.extname(file.originalname);
    if (ext !== '.csv') {
      return callback(/*res.end('Only images are allowed')*/ null, false)
    }
    callback(null, true)
  }
});

let app = new express();
app.use(express.static('uploads'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('uploads'));

app.get('/', (req, res) => {

  res.render('index', { upload: false });

});

app.post('/', upload.any(), (req, res) => {

  if (!req.body && !req.files) {
    res.json({ success: false });
  } else {
    fs.createReadStream(`${req.files[0].path}`)
      .pipe(csv())
      .on('data', (data) => {
        try {
          console.log(data);

          request({
            url: 'https://loremflickr.com/240/320/boy',
            encoding: null
          }, (error, response, body) => {

            console.log(body instanceof Buffer);

            let name = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
            fs.writeFile(`./uploads/${name}.png`, body, {
              encoding: null
            }, (err) => {

              if (err)
                throw err;
              console.log('It\'s saved!');
              let user = new User();
              user.name = data['Name'];
              user.salary = data['Salary'];
              user.efficiency = data['Efficiency'];
              user.total_experience = data['Total Experience'];
              user.image = `${name}.png`;
              user.save();
            });

          });


        }
        catch (err) {
        }
      })
      .on('end', () => {

        res.render('index', { upload: true });

      });

  }
});

app.get('/user-list', (req, res) => {

  User.find({}, (err, data) => {

    res.render('list', { data: data, moment:moment });

  })

});

app.get('/get-user-data', (req, res) => {

  if (req.query.group_by == 'efficiency') {
    User.aggregate([
      { "$group": { _id: "$efficiency", count: { $sum: 1 }, salary: { $sum: "$salary" } } }
    ], (err, data) => {

      res.json(data);

    })
  }

  if (req.query.group_by == 'experience') {
    User.aggregate([
      { "$group": { _id: "$total_experience", count: { $sum: 1 }, salary: { $sum: "$salary" } } }
    ], (err, data) => {

      res.json(data);

    })
  }

  if (req.query.group_by == 'range') {
    User.aggregate([{
      $match: {
        $and: [
          { "efficiency": { $gte: Number(req.query.min) } },
          { "efficiency": { $lte: Number(req.query.max) } }
        ]
      }
    },
    { $group: { _id: null, sum: { $sum: "$salary" } } }], (err, data) => {
      console.log('asas', err);
      let sum = data && data[0] && data[0].sum ? data[0].sum : 0;
      res.json({ mssg: `Total salary of employees which efficiencies between ${req.query.min} and ${req.query.min} is ${sum}.` });

    })
  }

});

var port = 2000;
app.listen(port, () => { console.log('listening on port ' + port); });