const connection = require('../tests/helpers/db');

const newMessage = (message) => {
  connection().then((db) => db.collection('messages').insertOne(message));
};

const getAllMessages = () => connection().then((db) => db.collection('messages').find({}).sort({ time: 1 }).toArray());

module.exports = {
  newMessage,
  getAllMessages,
};
