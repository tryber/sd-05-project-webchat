const { getMessages } = require('../models/messages');

module.exports = {
  messagesList: async (_, res) => {
    const messages = await getMessages();
    res.status(200).render('index', { messages });
  },
};
