const connection = require('./connection');

async function saveMessages(message) {
  const db = await connection();
  const messageSaved = await db.collection('messages').insertOne(message);
  return messageSaved.ops[0];
}

async function getMessages() {
  const db = await connection();
  const allMessages = db.collection('messages').find().toArray();

  return allMessages;
}

module.exports = {
  saveMessages,
  getMessages,
};
