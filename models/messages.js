const connection = require('../tests/helpers/db');

module.exports = {
  addMessage: async (data) => {
    const db = await connection();
    await db.collection('messages').insertOne(data);
  },
};
