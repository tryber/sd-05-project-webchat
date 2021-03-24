const connection = require('./connection');

const createMessage = async (chatMessage) => {
  try {
    const db = await connection();
    const message = await db.collection("messages").insertOne(chatMessage);
    return message.ops[0];
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const createPrivateMessage = async (chatMessage) => {
  try {
    const db = await connection();
    const privateMessage = await db
      .collection("private")
      .insertOne(chatMessage);
    return privateMessage.ops[0];
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getMessages = async () => {
  try {
    const db = await connection();
    const AllMessages = await db.collection("messages").find({}).toArray();
    return AllMessages;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

module.exports = {
  createMessage,
  createPrivateMessage,
  getMessages,
};
