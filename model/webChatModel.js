const connection = require('./connection');

async function saveMessages(message) {
  const { realTime, nickname, chatMessage } = message;
  const db = await connection();
  const messageSaved = await db.collection('messages').insertOne({ realTime, chatMessage, nickname });
  console.log('linha 7', messageSaved.ops[0]);
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
