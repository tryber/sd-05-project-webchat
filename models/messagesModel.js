const connection = require('./connection');

// TODO friday: understand why db does not appear despite of "use webchat" in mongod

const createMessage = (fullMessage) =>
connection().then((db) => db.collection('messages').insertOne(fullMessage));

const getMessages = () =>
  connection().then((db) =>
    db.collection('messages').find().toArray());

module.exports = {
  createMessage,
  getMessages,
};
