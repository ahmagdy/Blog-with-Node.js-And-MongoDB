var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var categorySchema = new Schema({
    Name: {
        type: String,
        unique: true,
        required: true
    }
});

categorySchema.plugin(uniqueValidator);

module.exports = mongoose.model('Category',categorySchema);