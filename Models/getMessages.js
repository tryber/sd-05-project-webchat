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
          from: { $eq: from },
          to: { $eq: to },
        },
        {
          from: { $eq: to },
          to: { $eq: from },
        },
      ],
    })
    .toArray();
  console.log(message);
  return message;
};

module.exports = {
  getMessages,
  getPrivateMessages,
};
