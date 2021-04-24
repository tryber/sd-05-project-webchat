const connection = require('../tests/helpers/db');

const getAll = () =>
  connection().then((db) =>
    db.collection('messages').find({}).sort({ time: 1 }).toArray());

const insert = (messageObj) =>
  connection().then((db) => db.collection('messages').insertOne(messageObj));

module.exports = {
  getAll,
  insert,
};
