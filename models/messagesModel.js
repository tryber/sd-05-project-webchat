const moment = require('moment');
const connection = require('./connection');

const collection = 'messages';

const newMessage = async (nickname, chatMessage) => {
  const db = await connection();
  const insertedData = await db.collection(collection).insertOne({
    nickname,
    chatMessage,
    time: moment(Date.now()).format('DD-MM-yyyy HH:mm:ss'),
  });
  return insertedData.ops[0];
};

const messagesHistory = async () => {
  const db = await connection();
  const dataMessages = await db.collection(collection).find().sort({ time: 1 }).toArray();
  return dataMessages.map((data) => `${data.time} - ${data.nickname}: ${data.chatMessage}`);
};

module.exports = {
  newMessage,
  messagesHistory,
};
