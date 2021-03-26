const connection = require('./connection');

const createMessages = async ({ nickName, message, data }) => {
  await connection().then((db) => {
    db.collection('messages').insertOne({ nickName, message, data });
  });
};

const allMessages = async () => {
  const historic = await connection().then((db) => 
  db.collection('messages').find().toArray());
  return historic;
}

module.exports = { createMessages, allMessages };
