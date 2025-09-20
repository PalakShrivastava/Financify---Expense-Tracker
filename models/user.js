const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  }
});

// ye plugin add karega: password hash, salt, aur authenticate methods
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
