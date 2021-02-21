const connection = require('./connection');

const createMessage = async ({ nickname, chatMessage, timestamp }) => {
  try {
    const message = await connection()
      .then((db) => db.collection('messages')
        .insertOne({ nickname, chatMessage, timestamp }));
    return message.ops[0];
  } catch (error) {
    console.error(error.message);

    return error.message;
  }
};

module.exports = {
  createMessage,
};
