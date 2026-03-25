const mongoose = require('mongoose');

const faqsSchema = new mongoose.Schema({
  question: {
    type: String,
    reuired: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.schema('FAQsModel', faqsSchema);