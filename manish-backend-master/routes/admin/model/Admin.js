var mongoose = require("mongoose");
const moment = require("moment");
const now = moment();

var adminSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true
  },
  password: { 
    type: String, 
    required: true
  },
  userCreated: {
    type: String,
    default: now.format("dddd, MMMM Do YYYY, h:mm:ss a")
  }
});

module.exports = mongoose.model("Admin", adminSchema);
