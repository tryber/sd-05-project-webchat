const connection = require('./connection');

const theCollection = 'messages';

const create = async (nickname, chatMessage, timestamp) => {
  const insert = await connection()
    .then((db) => db.collection(theCollection)
      .insertOne({ nickname, chatMessage, timestamp }));
  return insert.ops[0];
};

module.exports = {
  create,
};
