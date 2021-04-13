const connection = require('./connection');

const createMessage = async ({ dateFormat, nickname, chatMessage }) => {
  try {
    const newMessage = await connection().then((db) =>
      db.collection('messages').insertOne({ dateFormat, nickname, chatMessage }));
    // console.log(newMessage); saw that object is inside ops array
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
