const connection = require('../tests/helpers/db');

const addMessage = async (data) => {
  const db = await connection();
  const newMessage = await db.collection('messages').insertOne(data);
  // console.log(newMessage, 'new message');
  return newMessage.ops[0];
};

const getAllMessages = async () => {
  const db = await connection();
  const allMessages = await db.collection('messages').find().toArray();
  return allMessages;
};

module.exports = {
  addMessage,
  getAllMessages,
};
