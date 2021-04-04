const socketIo = require('socket.io');
const { getPrivateMessages, getMessages } = require('../Models/getMessages');

const transformDate = (date) =>
  new Date(date)
    .toLocaleDateString('en-US', {
      year: 'numeric',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    .replace(/\//g, '-')
    .replace(/,/g, '');

const formatMessage = (from, to) => (message) => ({
  from,
  to,
  message,
  createdAt: transformDate(new Date()),
});

const formatMessageToFront = (message, privateParam) => {
  if (!privateParam) {
    return `${message.createdAt} - ${message.from} : ${message.message}`;
  }
  return `${message.createdAt} (private) - ${message.from} : ${message.message}`;
};

const run = (...server) => async ({ mongoConnection }, onlineUsers) => {
  // Setup connection
  const io = socketIo(...server);

  io.on('connection', async (socket) => {
    const { id } = socket;
    let name = parseInt(Math.random() * 100000, 10);
    onlineUsers.unshift([name, id]);
    console.log(name, id);
    socket.emit('connected', { id, name });
    io.emit('greeting', { name });
    io.emit('newUserConnected', { name, id });
    socket.on('disconnect', () => {
      console.log('passei');
      onlineUsers.forEach((user, index) => {
        console.log(user);
        console.log(onlineUsers.indexOf([name, id]));
        if (user[0] === name && user[1] === id) {
          onlineUsers.splice(index, 1);
        }
      });
      io.emit('userDisconnected', { name, id });
    });
    socket.on('nameChange', ({ id: idParam, input, nickname }) => {
      onlineUsers.forEach((user, index) => {
        if (user[0] === nickname && user[1] === idParam) {
          onlineUsers.splice(index, 1);
        }
      });
      onlineUsers.push([input, idParam]);
      name = input;
      io.emit('updateOnlineUsers', onlineUsers);
    });
    socket.on('getPublicMessages', async () => {
      const messages = await getMessages();
      const formated = messages.map((message) => formatMessageToFront(message));
      socket.emit('getPublicMessages', { messages: formated });
    });
    socket.on('getPrivateHistory', async ({ nickname, to }) => {
      const messages = await getPrivateMessages(nickname, to);
      const formated = messages.map((message) => formatMessageToFront(message, true));
      socket.emit('getPrivateHistory', { messages: formated });
    });
    socket.on('message', async ({ nickname: nameParam, to, chatMessage }) => {
      const messages = await mongoConnection('messages');
      await messages
        .collection('messages')
        .insertOne(formatMessage(nameParam, to)(chatMessage));
      if (!to) {
        io.emit(
          'message',
          formatMessageToFront(formatMessage(nameParam, to)(chatMessage)),
        );
      } else {
        let idTo;
        onlineUsers.forEach((user, index) => {
          if (user[0] === to) {
            const indexOne = 1;
            const buffer = onlineUsers[index];
            idTo = buffer[indexOne];
          }
        });
        socket.emit(
          'message',
          formatMessageToFront(formatMessage(nameParam, to)(chatMessage), true),
        );
        socket.broadcast
          .to(idTo)
          .emit(
            'message',
            formatMessageToFront(
              formatMessage(nameParam, to)(chatMessage),
              true,
            ),
          );
      }
    });
  });
};

module.exports = {
  run,
};
