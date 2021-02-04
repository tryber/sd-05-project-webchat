const routes = require('express').Router();
const model = require('../models/messageModel');

routes.get('/', async (_req, res) => {
  const messages = await model.getAllMessages();

  res.render('index', { messages });
});

module.exports = routes;
