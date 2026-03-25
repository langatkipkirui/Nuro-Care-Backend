const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userLocation: {
    type: String,
    required: true,
  },
  userAvatar: {
    type: String,
    default: null,
  },
  review: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('ReviewModel', reviewSchema);
