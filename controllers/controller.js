const messages = require('../models/messages');
const users = require('../models/users');

const listMessagesAndUsers = async (req, res) => {
  try {
    const historyMessages = await messages.getMessages();
    const onlineUsers = await users.getUsers();
    res.render('index', { historyMessages, onlineUsers });
    console.log('controller done');
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  listMessagesAndUsers,
};
