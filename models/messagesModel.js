const connection = require('./connection');

async function createMessage(chatMessage, addresse, target) {
  const db = await connection();
  const message = await db.collection('messages').insertOne({ chatMessage, addresse, target });

  return message.ops[0];
}

async function getPrivateMessages(some, other) {
  const db = await connection();
  const allMessagesPrivate = db
    .collection('messages')
    .find({
      $or: [
        { addresse: some, target: other },
        { addresse: other, target: some },
      ],
    })
    .toArray();
  return allMessagesPrivate;
}

async function getMessages() {
  const db = await connection();
  const allMessages = db
    .collection('messages')
    .find({ addresse: { $eq: null } })
    .toArray();

  return allMessages;
}

module.exports = {
  createMessage,
  getPrivateMessages,
  getMessages,
};
