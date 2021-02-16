const connection = require('./connection');

const getAll = async () => connection('products').then((db) => db.find().toArray());

const createMessage = async (name, quantity) =>
  connection('message')
    .then((db) => db.insertOne({ name, quantity }))
    .then((result) => ({ _id: result.insertedId, name, quantity }));

module.exports = { getAll, createMessage };
