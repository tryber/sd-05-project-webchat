const getCollection = require('./connection');

// collection messages => date.now() + nickname + msg

const getMessages = async () => {
  try {
    const history = await getCollection('messages').then((messages) => messages.find().toArray());
    // console.log(`model: ${history[0]}`);
    return history;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

const create = async ({ date, time, nickname, chatMessage }) => {
  try {
    const insertNew = await getCollection('messages').then((messages) => messages.insertOne({ date, time, nickname, chatMessage }));
    // console.log("insert ok");
    return insertNew;
  } catch (error) {
    console.log('deu ruim inserir msg nova', error.message);
    return error.message;
  }
};

module.exports = {
  getMessages,
  create,
};
