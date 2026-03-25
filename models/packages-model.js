const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  packageName: {
    type: String,
    required: true,
  },
  packageFee: {
    type: String,
    required: true,
  },
  packageHeroTitle: {
    type: String,
    required: true,
  },
  packageBenefits: {
    type: [String],
    required: true,
  },
});

module.exports = mongoose.mode('PackageModel', packageSchema);
