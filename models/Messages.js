const connection = require('../tests/helpers/db');

module.exports = {
  addMessage: async (msgData) => {
    const db = await connection();
    const insertedMsg = await db
      .collection('messages')
      .insertOne(msgData);
    return insertedMsg.ops[0];
  },
  allMessages: async () => {
    const db = await connection();
    const messages = await db
      .collection('messages')
      .find().toArray();
    return messages;
  },
};
