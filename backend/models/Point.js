const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: {
    lat: Number,
    lng: Number,
  },
  tags: [String],
  imageUrl: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Point', pointSchema);
