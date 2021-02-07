const { MongoClient } = require('mongodb');

require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'webchat';
const DB_URL = process.env.DB_URL || `mongodb://mongodb:27017/${DB_NAME}`;
let connection = null;

module.exports = async (collection) => {
  try {
    connection = connection || await MongoClient.connect(
      DB_URL,
      { useUnifiedTopology: true, useNewUrlParser: true }
    );
    return await connection.db(DB_NAME).collection(collection);
  } catch {
    await client.close();
  }
};

