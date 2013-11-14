/*
* More details here http://mongoosejs.com/docs/guide.html
*/

var mongoose = require("mongoose");

//connect to database
var db = mongoose.connect('mongodb://127.0.0.1:27017/test');
var time = require('time');

// Create a new Date instance, representing the current instant in time
var now = new time.Date();

now.setTimezone("Asia/Shanghai");
//create schema for chat msg
var chatSchema = new mongoose.Schema({
  from: String,
  to:   String,
  msg: String,
  date: { type: Date, default: now.toString() }
});
//compile schema to model


module.exports = db.model('chat', chatSchema)
