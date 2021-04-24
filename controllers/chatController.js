const messagesModel = require('../models/messagesModel');
const usersModel = require('../models/usersModel');

const getAll = async (_req, res) => {
  const users = await usersModel.getAll();
  const messages = await messagesModel.getAll();
  return res.render('home', {
    users,
    messages,
  });
};

module.exports = {
  getAll,
};
