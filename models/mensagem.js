const dbConnection = require('./connection');

const getAll = async () => {
  const dbs = await dbConnection();
  return dbs
    .collection('messages')
    .find({
      to: { $exists: false },
    })
    .toArray();
};

const getPrivate = async (personOne, personTwo) => {
  const dbs = await dbConnection();
  return dbs
    .collection('messages')
    .find({
      $or: [
        {
          to: personOne,
          from: personTwo,
        },
        {
          to: personTwo,
          from: personOne,
        },
      ],
    })
    .toArray();
};

const createMessage = async (message) => {
  const dbs = await dbConnection();
  return dbs.collection('messages').insertOne({ message });
};

const createPrivateMessage = async (message, to, from) => {
  const dbs = await dbConnection();
  return dbs.collection('messages').insertOne({ message, to, from });
};

module.exports = { getAll, createMessage, createPrivateMessage, getPrivate };
