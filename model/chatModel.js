// const { ObjectId } = require('mongodb');
const connection = require('./connection');

const getAllMessages = async () => {
  const allMessages = await connection().then((db) =>
    db.collection('messages').find().toArray());
  return allMessages;
};

const createMessage = async ({ nickName, message, data }) => {
  await connection().then((db) => {
    db.collection('messages').insertOne({ nickName, message, data });
  });
};

module.exports = { getAllMessages, createMessage };
