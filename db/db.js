require('dotenv').config();
const mongoose = require('mongoose');

async function connectToDb() {
  try {
    mongoose.connect(process.env.MONGO_URI);
    console.log('Mongo Db Connected');
  } catch (error) {
    console.log(error);
  }
}

module.exports = connectToDb;