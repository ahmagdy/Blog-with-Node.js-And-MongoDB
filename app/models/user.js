var mongoose = require('mongoose');
var bcrypt = require('bcrypt-node');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var userSchema  = new Schema({
    name: String,
    username:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        unique: true,
        select : false
    },
    imageURL: {
        type: String,
        default: ''
    },
    Role:{
        type:String,
        required: true,
        default: 'user'
    },
    bio: String,
    Social:{
        FaceBook:String,
        Twitter: String,
        WebSite: String,
        LinkedIn: String,
        YouTube : String
    }
});

userSchema.plugin(uniqueValidator);

userSchema.pre('save',function(next){
    var user = this;
    if(user.password){
        bcrypt.hash(user.password,null,null,function(err,hashedPassword){
            if(err) {
                return;
            }
            user.password=  hashedPassword;
            next();
        });
    }
});

userSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password,this.password);
};

module.exports = mongoose.model('user',userSchema);