/*
* More details here http://mongoosejs.com/docs/guide.html
*/

var mongoose = require("mongoose");

//connect to database
var db = mongoose.connect('mongodb://127.0.0.1:27017/test');

//create schema for chat msg
var chatSchema = new mongoose.Schema({
  from: String,
  to:   String,
  msg: String,
  date: { type: Date, default: Date.now }
});

//compile schema to model
module.exports = db.model('chat', chatSchema)
