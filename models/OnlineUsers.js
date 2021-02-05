const connection = require('./connection');

const create = async (nickname, timeStamp) => {
  const db = await connection();
  await db.collection('onlineUsers').insertOne({ nickname, timeStamp })
    .then((result) => result.insertedId)
    .catch((err) => console.err(err));
};

const getAll = async () => {
  const db = await connection();
  return db.collection('onlineUsers').find().toArray();
};

// const exclude = async()

module.exports = {
  create,
  getAll,
};
