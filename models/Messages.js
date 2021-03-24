const connection = require('./connection');

const newMessage = async (data) => {
  try {
    const db = await connection();
    const message = await db.collection('messages').insertOne(data);
    return message.ops[0];
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const getMessages = async () => {
  try {
    const db = await connection();
    const messages = await db.collection('messages').find({}).toArray();
    return messages;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

module.exports = {
  newMessage,
  getMessages,
};
