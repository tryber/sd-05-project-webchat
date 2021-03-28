const dbConnection = require('./connection');

const getAll = async () =>
  dbConnection('products').then((db) => db.find().toArray());

const createMessage = async (name, quantity) =>
  dbConnection('message')
    .then((db) => db.insertOne({ name, quantity }))
    .then((result) => ({ _id: result.insertedId, name, quantity }));

module.exports = { getAll, createMessage };
