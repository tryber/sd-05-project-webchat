const { Router } = require('express');
const { getMessages } = require('../Models/getMessages');

const home = Router();
home.get('/', async (req, res) => {
  const messages = await getMessages();
  return res.render('home', { messages });
});

module.exports = home;
