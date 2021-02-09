const connection = require('./connection');

const getAll = async () => {
  try {
    const db = await connection();
    const users = await db.collection('users').find().toArray();
    return users;
  } catch (e) {
    return e.message;
  }
};

const add = async (id, nickname) => {
  try {
    const db = await connection();
    const addUser = await db.collection('users').insertOne({
      id,
      nickname
    });
    return addUser.ops[0];
  } catch (e) {
    return e;
  }
};

module.exports =  {
  add,
  getAll,
};
