const connection = require('./connection');

async function createMessage(chatMessage, nickname, dateTime) {
  const db = await connection();
  const message = await db.collection('messages').insertOne({ chatMessage, nickname, dateTime });

  return message.ops[0];
}

async function getMessages() {
  const db = await connection();
  const allMessages = db.collection('messages').find().toArray();

  return allMessages;
}

module.exports = {
  createMessage,
  getMessages,
};
