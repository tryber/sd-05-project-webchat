const connection = require('./connection');

const createMessage = async (message) => {
  const db = await connection();
  const newMessage = await db.collection('messages').insertOne(message);
  return newMessage.ops[0];
};

const getMessages = async () => {
  const db = await connection();
  const message = await db
    .collection('messages')
    .find({ target: { $eq: 'Everyone' } })
    .toArray();
  return message;
};

const getPrivateMessages = async (target, user) => {
  const db = await connection();
  const message = await db
    .collection('messages')
    .find({
      $or: [
        { target, user },
        { user: target, target: user },
      ],
    })
    .toArray();
  return message;
};

module.exports = { createMessage, getMessages, getPrivateMessages };
