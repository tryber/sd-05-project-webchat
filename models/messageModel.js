const moment = require('moment');
const getCollection = require('./getCollection');

const formatDate = 'DD-MM-yyyy HH:mm:ss';

const createMessage = async (nickname, chatMessage) => {
  const con = await getCollection();
  const createdMessage = await con.collection('messages').insertOne({
    nickname,
    chatMessage,
    time: moment(Date.now()).format(formatDate),
  });
  return createdMessage.ops[0];
};

const getMessages = async () => {
  const con = await getCollection();
  const getM = await con.collection('messages').find().sort({ time: 1 }).toArray();
  return getM.map((message) => `${message.time} - ${message.nickname}: ${message.chatMessage}`);
};
module.exports = {
  createMessage,
  getMessages,
};
