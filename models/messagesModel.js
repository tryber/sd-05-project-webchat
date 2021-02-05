const connection = require("./connection");

// const getAll = async () => await connection('messages').then(messages => messages.find().toArray());

const getAll = async () => await connection().then(db => db.collection('messages').find().toArray());

const postMessage = async ({nickname, chatMessage}) => await connection().then(db => db.collection('messages').insertOne({nickname, chatMessage}));

module.exports = { getAll, postMessage };