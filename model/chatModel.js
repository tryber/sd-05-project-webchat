// const { ObjectId } = require('mongodb');
const connection = require('./connection');

const getAllMessages = async () => {
  const allMessages = await connection().then((db) =>
    db.collection('messages').find().toArray());
  return allMessages;
};

const createMessage = async ({ nickname, chatMessage, data }) => {
  await connection().then((db) => {
    db.collection('messages').insertOne({ nickname, chatMessage, data });
  });
};

module.exports = { getAllMessages, createMessage };
