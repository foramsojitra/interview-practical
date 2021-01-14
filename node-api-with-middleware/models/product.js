var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ProductSchema = new Schema({
	id:Number,
    name: String,
    description: String,
    amount: Number,
    image_url:String,
    in_stock:Boolean,
    created_at: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', ProductSchema)