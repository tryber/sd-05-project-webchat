const messages = require('../models/messages');

const listMessages = async (req, res) => {
  try {
    const historyMessages = await messages.getMessages();
    res.render('index', { historyMessages });
  } catch (error) {
    console.log(error.message)
  }
};

// const createAuthor = async (req, res) => {
//   const { first_name, middle_name, last_name } = req.body;

//   if (!Author.isValid(first_name, middle_name, last_name)) {
//     return res.render('authors/new', { message: 'Dados inválidos' });
//   }

//   await Author.create(first_name, middle_name, last_name);
//   res.redirect('authors');
// };


module.exports = {
  listMessages,
  // showAuthor,
  // newAuthor,
  // createAuthor,
};
