const connection = require('./connection');

async function sendMessage(data) {
  const message = await connection().then((db) => db.collection('messages').insertOne(data));

  console.log(message);
  return message;
}

async function getAllMessages() {
  const messages = await connection().then((db) => db.collection('messages').find().toArray());

  return messages;
}

module.exports = { sendMessage, getAllMessages };
