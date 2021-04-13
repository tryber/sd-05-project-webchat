const connection = require('../tests/helpers/db');

module.exports = {
  addMessage: async (data) => {
    const db = await connection();
    const a = await db.collection('messages').insertOne(data);
    return a.ops[0];
  },
  getMessages: async () => {
    const db = await connection();
    const messages = await db.collection('messages').find().toArray();
    return messages;
  },
};
