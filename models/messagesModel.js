const connection = require('../tests/helpers/db');

const getAll = () =>
  connection().then((db) =>
    db.collection('messages').find({}).sort({ _id: 1 }).toArray());

const insert = (message) =>
  connection().then((db) => db.collection('messages').insertOne(message));

const deleteAll = () =>
  connection().then((db) => db.collection('messages').deleteMany({}));

module.exports = {
  getAll,
  insert,
  deleteAll,
};
