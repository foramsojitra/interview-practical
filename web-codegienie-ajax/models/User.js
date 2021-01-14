var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema( {
	name: String,
	salary:Number,
	efficiency:Number,
	total_experience: Number,
	image:String,
	created_on:{
		type: Date,
		default: Date.now
	},
	updated_on:{
		type: Date,
		default: Date.now
	}
}),
User = mongoose.model('User', userSchema);

module.exports = User;