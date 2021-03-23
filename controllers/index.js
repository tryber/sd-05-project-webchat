const { Router } = require('express');
const Message = require('../models/Messages');
const User = require('../models/User');

const create = Router();

create.get('/', async (_req, res) => {
  const messages = await Message.getAll();
  const users = await User.getAllUsers();
  res.render('index', { messages, users });
});

module.exports = create;
