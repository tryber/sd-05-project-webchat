const express = require('express');

const router = express.Router();

const { getMessages } = require('../model/messagesModel');

router.get('/', async (_req, res) => {
  const getAllMessages = await getMessages();
  console.log(getAllMessages);
  return res.render('index', { getAllMessages });
});

module.exports = router;