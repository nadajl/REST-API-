const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  age: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the User model
module.exports = mongoose.model('User', userSchema);