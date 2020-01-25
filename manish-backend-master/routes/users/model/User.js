var mongoose = require("mongoose");
const moment = require("moment");
const now = moment();

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    default: ""
  },
  firstName: {
    type: String,
    trim: true,
    default: ""
  },
  lastName: {
    type: String,
    trim: true,
    default: ""
  },
  birthday: {
    type: String,
    default: ""
  },
  age: {
    type: String,
    trim: true,
    default: ""
  },
  lastName: {
    type: String,
    trim: true,
    default: ""
  },
  educationLevel: {
    type: String,
    trim: true,
    default: ""
  },
  schoolName: {
    type: String,
    trim: true,
    default: ""
  },
  interests: {
    type: Array,
    default: []
  },
  linkedInStrategy: {
    type: Boolean,
    default: false
  },
  pictureUploaded: {
    type: Boolean,
    default: false
  },
  pictureName: {
    type: String,
    trim: true,
    default: ""
  },
  gender: { 
    type: String, 
    default: "" 
  },
  password: { 
    type: String, 
    default: "" 
  },
  userCreated: {
    type: String,
    default: now.format("dddd, MMMM Do YYYY, h:mm:ss a")
  },
  resetPassword: {
   token: String,
   tokenExpires:  Date
  }
});

module.exports = mongoose.model("User", UserSchema);
