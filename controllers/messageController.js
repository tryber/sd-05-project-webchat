const { Router } = require('express');
const Message = require('../models/Message');

const create = Router();

create.get('/', async (_req, res) => {
  const message = await Message.getAll();

  res.render('index', { message });
});

module.exports = create;
