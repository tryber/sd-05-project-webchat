const messages = require('../models/messages');

const listMessages = async (req, res) => {
  try {
    const historyMessages = await messages.getMessages();
    res.render('index', { historyMessages });
    console.log(`controller: ${historyMessages[0]}`);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  listMessages,
};
