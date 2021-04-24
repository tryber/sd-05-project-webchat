const dateFormat = require('dateformat');

const createMessageProfile = (nickname, chatMessage) => {
  const now = new Date();
  const data = dateFormat(now, 'dd-mm-yyyy');
  const hora = dateFormat(now, 'HH:mm:ss');

  return {
    nickname,
    chatMessage,
    data,
    hora,
  };
};

module.exports = createMessageProfile;
