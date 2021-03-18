const connection = require('../tests/helpers/db');
const { COLLECTIONS } = require('../enumerators/enums');

module.exports = {
  addMessage: async (msgData) => {
    const db = await connection();
    const insertedMsg = await db
      .collection(COLLECTIONS.MESSAGES)
      .insertOne(msgData);
    return insertedMsg.ops[0];
  },
};
