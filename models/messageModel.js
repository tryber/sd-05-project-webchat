const moment = require('moment');
const connection = require('./connection');

const collectionName = 'messages';

const createMessage = async (nickname, chatMessage) => {
  const db = await connection();
  return db.collection(collectionName).insertOne({
    nickname,
    chatMessage,
    time: moment(Date.now()).format('DD-MM-yyyy HH:mm:ss'),
  });
};

const getMessagesHistory = async () => {
  const db = await connection();
  const messagesFromDb = await db.collection(collectionName).find().sort({ time: 1 }).toArray();
  return messagesFromDb.map(
    (message) => `${message.time} - ${message.nickname}: ${message.chatMessage}`,
  );
};

module.exports = { createMessage, getMessagesHistory };
