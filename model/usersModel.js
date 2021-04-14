const connection = require('./connection');

const createUser = async (date, nickname, message) => {
  const newInsert = await connection()
    .then((db) => db.collection('messages').insertOne({ date, nickname, message }));
  return newInsert;
};
const getAll = async () => {
  const messagesArray = await connection()
    .then((db) => db.collection('messages').find().toArray());
  return messagesArray;
};

module.exports = {
  createUser,
  getAll,
};
