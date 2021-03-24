const connection = require('../tests/helpers/db');

const createMessage = async (messageObj) => {
  try {
    const database = await connection();
    const message = await database.collection('messages').insertOne(messageObj);
    return message.ops[0];
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const createPrivateMessage = async (messageObj) => {
  try {
    const database = await connection();
    const privateMessage = await database.collection('private').insertOne(messageObj);
    return privateMessage.ops[0];
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getMessages = async () => {
  try {
    const database = await connection();
    const messages = await database.collection('messages').find({}).toArray();
    return messages;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

module.exports = {
  createMessage,
  createPrivateMessage,
  getMessages,
};
