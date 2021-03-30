const connection = require('./connection');

async function saveMessages(message) {
  const db = await connection();
  const messageSaved = await db.collection('messages').insertOne({ message });
  return messageSaved.ops[0];
}

async function getMessages() {
  const db = await connection();
  const allMessages = await db.collection('messages').find({}).toArray();
  console.log('aqui no model:', allMessages);
  return allMessages;
}

module.exports = {
  saveMessages,
  getMessages,
};
