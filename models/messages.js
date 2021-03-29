const connection = require('./connection');

async function createMessage(parametros) {
  const db = await connection();
  const message = await db
    .collection('messages')
    .insertOne(parametros);
  return message.ops[0];
}

async function getMessage() {
  const db = await connection();
  const message = await db.collection('messages').find({}).toArray();
  console.log(message);
  return message;
}

module.exports = { createMessage, getMessage };
