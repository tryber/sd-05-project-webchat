const connection = require('./connection');

const addMessage = async (msgData) => {
  const db = await connection();
  const newMessage = await db
    .collection('messages')
    .insertOne(msgData);
  return newMessage.ops[0];
};

module.exports = {
  addMessage,
};
