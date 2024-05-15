const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  path: String,
  createdAt: {
      type: Date,
      default: Date.now
  }
  });
  
  const imageModel = mongoose.model('image', imageSchema);
  module.exports = {imageModel}


