var mongoose = require('mongoose');
var Schema = mongoose.Schema;

moviedbSchema = new Schema( {
	id: String,
	title: String,
	released_year: String,
	rating: Number,
	genres : { type : Array , "default" : [] },
	date : String,
}),
moviedb = mongoose.model('moviedb', moviedbSchema);

module.exports = moviedb;