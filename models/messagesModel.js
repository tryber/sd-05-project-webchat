const connection = require('./connection');

// TODO friday: understand why db does not appear despite of "use webchat" in mongod

const createMessage = async ({ dateFormat, nickname, chatMessage }) => {
  try {
    const newMessage = await connection().then((db) =>
      db.collection('messages').insertOne({ dateFormat, nickname, chatMessage })
    );
    // console.log(newMessage); saw that object is inside ops array
    return newMessage.ops[0];
  } catch (err) {
    console.log(err);
  }
};

const getMessages = () => connection().then((db) => db.collection('messages').find().toArray());

module.exports = {
  createMessage,
  getMessages,
};
