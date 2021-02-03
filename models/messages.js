const connection = require('../tests/helpers/db');

module.exports = {
  addMessage: async (data) => {
    const db = await connection();
    await db.collection('messages').insertOne(data);
  },
  getMessages: async () => {
    const db = await connection();
    const messages = await db.collection('messages').find().toArray();
    return messages;
  },
};
