const dbConnection = require('./connection');

const getAll = async () => {
  const dbs = await dbConnection();
  return dbs.collection('messages').find().toArray();
};

const createMessage = async (message) => {
  const dbs = await dbConnection();
  return dbs.collection('messages').insertOne({ message });
};

module.exports = { getAll, createMessage };
