const connection = require('../tests/helpers/db');

const createMessage = async (message) => {
  try {
    const newMessage = await connection().then((db) =>
      db.collection('messages').insertOne(message));
    return newMessage.ops[0];
  } catch (err) {
    console.log(err);
  }
};

const getMessages = async () => {
  try {
    const allMessages = await connection().then((db) =>
      db.collection('messages').find().toArray());
    return allMessages;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createMessage,
  getMessages,
};
