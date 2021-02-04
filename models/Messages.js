const connection = require('./connection');

const create = async (nickname, chatMessage, timeStamp) => {
  const db = await connection();
  await db.collection('messages').insertOne({ nickname, chatMessage, timeStamp });
};

const getAll = async () => {
  const db = await connection();
  return db.collection('messages').find().toArray();
};

module.exports = {
  create,
  getAll,
};
