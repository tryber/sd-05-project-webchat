const getCollection = require('./connection');

// collection messages => date.now() + nickname + msg

const getMessages = async () => {
  try {
    const history = await getCollection('messages').then((messages) => messages.find().toArray());
    return history;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

const create = async ({ time, nickname, newMsg }) => {
  try {
    const insertNew = await getCollection('messages').then((messages) => messages.insertOne({ time, nickname, message: newMsg }));
    // console.log("insert ok");
    return insertNew;
  } catch (error) {
    console.log('deu ruim inserir msg nova', error.message);
    return error.message;
  }
};

module.exports = {
  getMessages,
  // getById,
  // // getUserByEmail,
  create,
  // update,
  // exclude,
  // uploadImage,
};
