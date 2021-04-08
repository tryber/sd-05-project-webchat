const connection = require('../tests/helpers/db');

const createMessage = (msgs, alvo, dest) =>
  connection().then((db) => db.collection('messages').insertOne({ msgs, alvo, dest }));

const getMessages = () =>
  connection().then((db) => db.collection('messages').find({ alvo: '' }).toArray());

const getPrivateMessages = (p1, p2) =>
  connection().then((db) =>
    db
      .collection('messages')
      .find({
        $or: [
          { alvo: p1, dest: p2 },
          { alvo: p2, dest: p1 },
        ],
      })
      .toArray());

module.exports = {
  createMessage,
  getMessages,
  getPrivateMessages,
};
