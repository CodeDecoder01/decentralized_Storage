var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NodeSchema = new Schema({
    _id: String,
    firstName: String,
    lastName: String,
    password: String,
},
{
    collection: 'NodeInfo',
    unique: 'true'
});

module.exports = mongoose.model('Node', NodeSchema);