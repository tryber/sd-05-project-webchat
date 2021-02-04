// const connection = require('./connection');

// const createMessage = (fullMessage) =>
// connection().then((db) => db.collection('messages').insertOne(fullMessage));

// const getMessages = () =>
//   connection().then((db) =>
//     db.collection('messages').find({}).sort({ _id: -1 }).toArray());

// const deleteMessages = () =>
//   connection().then((db) => db.collection('messages').deleteMany({}));

// module.exports = {
//   createMessage,
//   getMessages,
//   deleteMessages,
// };
