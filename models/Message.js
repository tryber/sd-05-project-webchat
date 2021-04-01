const connection = require('./connection');

const addMessage = async (msgData) => {
  const db = await connection();
  const newMessage = await db
    .collection('messages')
    .insertOne(msgData);
  return newMessage.ops[0];
};

const getAllMessages = async (search = {}) => {
  const db = await connection();
  const messages = await db
    .collection('messages')
    .find(search)
    .toArray();
  return messages;
};

module.exports = {
  addMessage,
  getAllMessages,
};
