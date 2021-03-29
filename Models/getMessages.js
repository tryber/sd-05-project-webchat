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

module.exports = {
  getMessages,
};
