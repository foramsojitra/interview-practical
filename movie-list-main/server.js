var express = require("express");
var app = express();

const imdb = require('imdb-api')
var bodyParser = require("body-parser");
var moviedb = require("./model/movie_db.js");
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/movie_db");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    title: 'Movie Apis'
  });
});

/*Api to search movie by name in local db if there is no record then find in imdb-api and 
store in localDB and give first movie record from localDB after storing reult*/
app.get("/search-by-name", (req, res) => {

  if (req.query && req.query.title) {

    findMovieInLocal(req, res);

  } else {
    res.status(400).json({
      errorMessage: 'Add proper parameter first!',
      status: false
    });
  }
});

/* finction to find movie in localDB */
function findMovieInLocal(req, res) {
  moviedb.find({ title: req.query.title })
    .then((movie) => {

      if (movie && movie.length > 0) {
        res.status(200).json({
          status: true,
          title: 'Movie Found.',
          movies: movie[0]
        });
      } else {
        findFromIMBDAndAdd(req, res);
      }

    }).catch(err => {

      res.status(400).json({
        errorMessage: err.message || err,
        status: false
      });

    });
}

/* finction to find movie using imdb-api */
function findFromIMBDAndAdd(req, res) {

  imdb.search({ 'name': req.query.title }, {
    apiKey: '35f1161b'
  }).then((movie) => {

    var movie_array = movie.results.map(v => ({ id: v.imdbid, title: v.title, released_year: v.year, date: new Date().toISOString() }));

    moviedb.insertMany(movie_array)
      .then((movie) => {

        findMovieInLocal(req, res);

      }).catch(err => {

        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });

      });


  }).catch(err => {
    res.status(400).json({
      errorMessage: err.message || err,
      status: false
    });
  });

};

/*Api to update genre or rating of movie*/
app.post("/update-genre-or-rating", (req, res) => {
  var data = req.body;
  if (data.id && (data.genres || data.rating)) {

    moviedb.find({ _id: data.id })
      .then((movie) => {
        console.log(movie);

        if (movie && movie.length > 0) {

          if (data.rating) {
            movie[0].rating = data.rating;
          }
          if (data.genres) {
            movie[0].genres = data.genres;
          }
          movie[0].save();

          res.status(200).json({
            status: true,
            title: 'Movie updated.'
          });

        } else {
          res.status(400).json({
            errorMessage: 'There is no movie with that id!',
            status: false
          });
        }

      }).catch(err => {

        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });

      });

  } else {
    res.status(400).json({
      errorMessage: 'Add proper parameter first!',
      status: false
    });
  }

});

/*Api to search by id, range of released year, range of rating and genres from local DB*/
app.get("/local-db-search", (req, res) => {

  var query = {};
  query["$and"] = [];
  query["$and"].push({
    _id: {
      $exists: true
    }
  });

  if (req.query && req.query.id) {
    query["$and"].push({
      id: req.query.id
    });
  }

  if (req.query && req.query.released_year) {
    query["$and"].push({
      released_year: req.query.released_year
    });
  }

  if (req.query && req.query.year_range_max) {
    query["$and"].push({
      released_year: { $gte: req.query.year_range_max }
    });
  }

  if (req.query && req.query.year_range_max) {
    query["$and"].push({
      released_year: { $lte: req.query.year_range_max }
    });
  }

  if (req.query && req.query.rating_min) {
    query["$and"].push({
      rating: { $gte: req.query.rating_min }
    });
  }

  if (req.query && req.query.genres) {
    var genre = req.query.genres.split(',');
    query["$and"].push({
      genres: {$in: genre}
    });
  }

  moviedb.find(query)
    .then((movie) => {

      if (movie && movie.length > 0) {
        res.status(200).json({
          status: true,
          title: 'Movie Found.',
          movies: movie
        });
      } else {
        res.status(400).json({
          errorMessage: 'There is no movie!',
          status: false
        });
      }

    }).catch(err => {

      res.status(400).json({
        errorMessage: err.message || err,
        status: false
      });

    });
});

app.listen(3000, () => {
  console.log("Todo in Runing On port 3000");
});
