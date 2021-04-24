const connection = require('./connection');

const postMessage = async (chatMessage, date, nickname) => {
  const db = await connection();
  await db.collection('messages').insertOne({ chatMessage, date, nickname });
};

const getMessage = async () => {
  const db = await connection();
  const msgFind = await db.collection('messages').find().toArray();
  return msgFind;
};

module.exports = { postMessage, getMessage };
