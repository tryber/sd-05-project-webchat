const connection = require('./connection');

const createMessage = async ({ date, nickname, chatMessage }) => {
  const message = await connection()
    .then(
      (db) => db
        .collection('messages')
        .insertOne({ date, nickname, chatMessage }),
    );

  return message.ops[0];
};

const getAllMessages = async () =>
  connection().then((db) => db.collection('messages').find({}).toArray());

module.exports = { createMessage, getAllMessages };
