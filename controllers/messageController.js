const express = require('express');

const router = express.Router();
const MessageModels = require('../models/MessageModel');

router.get('/', async (_req, res) => {
  const message = await MessageModels.getAll();

  res.render('index', { message });
});

module.exports = router;
