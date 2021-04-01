const connection = require('./connection');

const createMessage = async (chatMessage, origin, target) => {
  try {
    const db = await connection();
    const message = await db.collection('messages').insertOne({ chatMessage, origin, target });

    return message.ops[0];
  } catch (error) {
    console.log('Erro em createMessage');
  }
};

const getMessages = async () => {
  try {
    const db = await connection();
    const allMessages = db
      .collection('messages')
      .find({ origin: { $eq: null } })
      .toArray();

    return allMessages;
  } catch (error) {
    console.log('Erro em getMessages');
  }
};

const getPrivateMessages = async (some, other) => {
  try {
    const db = await connection();
    const messages = db
      .collection('messages')
      .find({
        $or: [
          { origin: some, target: other },
          { origin: other, target: some },
        ],
      })
      .toArray();

    return messages;
  } catch (error) {
    console.log('Erro em getPrivateMessages');
  }
};

module.exports = {
  createMessage,
  getMessages,
  getPrivateMessages,
};
