const connection = require('./connection');

const getAll = async () => {
  try {
    const db = await connection();
    const messages = await db.collection('messages').find().toArray();
    return messages;
  } catch (e) {
    return e.message;
  }
};

const add = async (nickname, chatMessage) => {
  try {
    const db = await connection();
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const time = date.toLocaleString('pt-BR', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });
    const addMessage = await db.collection('messages').insertOne({
      nickname,
      chatMessage,
      dateMessage: `${day}-${month}-${year} ${time}`,
    });
    return addMessage.ops[0];
  } catch (err) {
    return err;
  }
};

module.exports = {
  getAll,
  add,
};
