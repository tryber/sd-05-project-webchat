const connection = require('./connection');

const createMessage = (fullMessage) =>
connection().then((db) => db.collection('messages').insertOne(fullMessage));

const getMessages = () =>
  connection().then((db) =>
    db.collection('messages').find().toArray());

module.exports = {
  createMessage,
  getMessages,
};
