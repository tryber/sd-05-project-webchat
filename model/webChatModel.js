const connection = require('./connection');

async function saveMessages(message) {
  const { realTime, chatMessage, nickname } = message;
  const db = await connection();
  const messageSaved = await db.collection('messages').insertOne({ realTime, chatMessage, nickname });

  return messageSaved.ops[0];
};

async function getMessages() {
  const db = await connection();
  const allMessages = db.collection('messages').find().toArray();

  return allMessages;
};

module.exports = {
  saveMessages,
  getMessages,
};
