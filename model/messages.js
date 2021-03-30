const connection = require('./connection');

async function createMessage(chatMessage, origin, target) {
  const db = await connection();
  const message = await db.collection('messages').insertOne({ chatMessage, origin, target });

  return message.ops[0];
}

async function getMessages() {
  const db = await connection();
  const allMessages = db
    .collection('messages')
    .find({ origin: { $eq: null } })
    .toArray();

  return allMessages;
}

async function getMessagesPvt(some, other) {
  const db = await connection();
  const allMessagesPvt = db
    .collection('messages')
    .find({
      $or: [
        { origin: some, target: other },
        { origin: other, target: some },
      ],
    })
    .toArray();
  return allMessagesPvt;
}

module.exports = {
  createMessage,
  getMessages,
  getMessagesPvt,
};
