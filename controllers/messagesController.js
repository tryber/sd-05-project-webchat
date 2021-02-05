const models = require('../models');

const getAll = async (_, res) => {
  try {
    const historyMessage = await models.messages.getAll();
    res.render('index', { historyMessage });
  } catch (err) {
    console.error(err.message);
  }
};

const postMessage = async (req, res) => {
  try {
    const { post } = req.body;
    const newPost = await models.messages.postMessage(post);
    res.render('index', { post });
  } catch (err) {
    console.error(error.message);
  }
};

module.exports = { getAll, postMessage };
