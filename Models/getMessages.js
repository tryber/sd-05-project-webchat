const mongoConnection = require('./mongoDBModel');

const getMessages = async () => {
  const connection = await mongoConnection();
  const message = await connection
    .collection('messages')
    .find({
      to: {
        $eq: null,
      },
    })
    .toArray();
  return message;
};

const getPrivateMessages = async (from, to) => {
  const connection = await mongoConnection();
  const message = await connection
    .collection('messages')
    .find({
      $or: [
        {
          $and: [{ from: { $eq: from } }, { to: { $eq: to } }],
        },
        {
          $and: [{ from: { $eq: to } }, { to: { $eq: from } }],
        },
      ],
    })
    .toArray();
  return message;
};

module.exports = {
  getMessages,
  getPrivateMessages,
};
