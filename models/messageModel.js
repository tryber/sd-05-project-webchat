const connection = require('./connection');

async function createMessage(nickname, chatMessage, timestamp) {
  try {
    const message = await connection().then((db) =>
      db.collection('messages').insertOne({ nickname, chatMessage, timestamp }));

    return message.ops[0];
  } catch (error) {
    console.error(error.message);

    return error.message;
  }
}

async function getAllMessages() {
  try {
    const messages = await connection().then((db) => db.collection('messages').find().toArray());

    return messages;
  } catch (error) {
    console.error(error.message);

    return error.message;
  }
}

module.exports = { createMessage, getAllMessages };
