const getChat = async (_req, res) => {
  res.status(200).render('client');
};

module.exports = {
  getChat,
};
