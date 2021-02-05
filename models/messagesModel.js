const connection = require('./connection');

// const getAll = async () => await connection('messages')
// .then(messages => messages.find().toArray());

const getAll = async () => connection().then((db) => db.collection('messages').find().toArray());

const postMessage = async ({ nickname, chatMessage, timestamp }) => connection().then((db) => db.collection('messages').insertOne({ nickname, chatMessage, timestamp }));

module.exports = { getAll, postMessage };
