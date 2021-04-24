const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/webchat';
const DB_NAME = 'webchat' || process.env.DB_NAME;

const PARAMS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connection = async () => MongoClient.connect(MONGO_DB_URL, PARAMS)
  .then((conn) => conn.db(DB_NAME))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

module.exports = connection;
