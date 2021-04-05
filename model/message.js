const dbConnection = require('./connection');

const getAll = async () => {
  const dbs = await dbConnection();
  return dbs.collection('messages').find({ destiny: { $exists: false } }).toArray();
};
// VAI
const createMessage = async (message) => {
  const dbs = await dbConnection();
  return dbs.collection('messages').insertOne({ message });
};

const createMessagePvt = async (message, destiny, origin) => {
  const dbs = await dbConnection();
  return dbs.collection('messages').insertOne({ message, destiny, origin });
};

const getPvt = async (person1, person2) => {
  const dbs = await dbConnection();
  return dbs
    .collection('messages')
    .find({
      $or: [
        { origin: person1, destiny: person2 },
        { origin: person2, destiny: person1 },
      ],
    })
    .toArray();
};

module.exports = { getAll, createMessage, createMessagePvt, getPvt };
