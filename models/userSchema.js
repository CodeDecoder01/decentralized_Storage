var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    _id: String,
    firstName: String,
    lastName: String,
    password: String
},
{
    collection: 'userinfo',
    unique: 'true'
});

module.exports = mongoose.model('User', UserSchema);