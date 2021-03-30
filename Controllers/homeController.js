const { Router } = require('express');
const { getMessages } = require('../Models/getMessages');

const homeController = (onlineUsers) => {
  const home = Router();

  home.get('/', async (req, res) => {
    const messages = await getMessages();
    console.log('esseeeeeee', onlineUsers);
    return res.render('home', { messages, onlineUsers });
  });
  return home;
};

module.exports = { homeController };
