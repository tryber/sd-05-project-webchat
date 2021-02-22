const connection = require('./connection');

const createMessage = async ({ dateFormat, nickname, chatMessage }) => {
  try {
    const newMessage = await connection().then((db) =>
      db.collection('messages').insertOne({ dateFormat, nickname, chatMessage }));

    return newMessage.ops[0];
  } catch (e) {
    console.log(e);
  }
};

const getAllMessages = async () => {
  try {
    const allMessages = await connection().then((db) =>
      db.collection('messages').find().toArray());

    return allMessages;
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  createMessage,
  getAllMessages,
};
