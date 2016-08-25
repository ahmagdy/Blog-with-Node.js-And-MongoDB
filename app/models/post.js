var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var postSchema = new Schema({
    Title: {
        type: String,
        required: true
    },
    posturl:{
        type: String,
        required: true,
        unique:true
    },
    Content: {
        type: String,
        required: true
    },
    Author:{
        type: String,
        required: true
    },
    tags : [String],
    category: String,
    ImageURL : {
        type: String, 
        default : '#'
    },
    visitors: {
        type: Number,
        default : 0
    },
    PublishDate: Date
});

postSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Post',postSchema);