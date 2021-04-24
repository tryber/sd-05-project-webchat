const connection = require('./connection');

const createMessage = async ({ timestamp, nickname, chatMessage }) => {
  try {
    const message = await connection().then((db) => db.collection('messages').insertOne({ timestamp, nickname, chatMessage }));
    console.log(message);
    return message.ops[0];
  } catch (error) {
    console.error(error.message);
    return error.message;
  }
};

const getAll = async () => {
  try {
    const messages = await connection().then((db) => db.collection('messages').find().toArray());
    return messages;
  } catch (error) {
    console.error(error.message);
    return error.message;
  }
};

module.exports = {
  createMessage,
  getAll,
};
