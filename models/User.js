const connection = require('./connection');

const createUser = async ({ nickname }) => {
  try {
    const user = await connection().then((db) => db.collection('users').insertOne({ nickname }));
    return user.ops[0];
  } catch (error) {
    console.error(error.message);
    return error.message;
  }
};

const getAllUsers = async () => {
  try {
    const users = await connection().then((db) => db.collection('users').find().toArray());
    return users;
  } catch (error) {
    console.error(error.message);
    return error.message;
  }
};

module.exports = {
  createUser,
  getAllUsers,
};
