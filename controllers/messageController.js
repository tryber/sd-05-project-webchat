const routes = require('express').Router();
const model = require('../models/messageModel');

routes.get('/', async (_req, res) => {
  const messageHistory = await model.getAllMessages();
  res.render('index', { messageHistory });
});

module.exports = routes;
