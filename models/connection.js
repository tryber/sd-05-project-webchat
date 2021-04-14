const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/webchat';
const DB_NAME = 'webchat';

let connection;

const getCollection = async (collectionName) => {
  connection = connection || (await MongoClient.connect(MONGO_DB_URL,
    { useNewUrlParser: true, useUnifiedTopology: true }));

  return connection.db(DB_NAME).collection(collectionName);
};

module.exports = getCollection;
