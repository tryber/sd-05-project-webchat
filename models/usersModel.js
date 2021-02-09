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

const update = async (id, nickname) => {
  try {
    const db = await connection();
    await db.collection('users').updateOne({ id }, { $set: { nickname } });
    return true;
  } catch (err) {
    return null;
  }
};

const exclude = async (id) => {
  try {
    const db = await connection();
    await db.collection('users').deleteOne({ id });
    return true;
  } catch (err) {
    return null;
  }
};

module.exports = {
  add,
  getAll,
  update,
  exclude,
};
