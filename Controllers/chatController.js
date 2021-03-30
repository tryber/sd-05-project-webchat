const socketIo = require('socket.io');

const ZERO = 0;

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

const formatMessageToFront = (message) =>
  `${message.createdAt} - ${message.from} : ${message.message}`;

const run = (...server) => async ({ mongoConnection }, onlineUsers) => {
  // Setup connection
  const io = socketIo(...server);

  io.on('connection', async (socket) => {
    const { id } = socket;
    let name = parseInt(Math.random() * 100000, 10);
    onlineUsers.push([name, id]);
    console.log('Antes', onlineUsers);
    socket.emit('connected', { id, name });
    io.emit('newUserConnected', { name });
    io.emit('updateOnlineUsers', onlineUsers);
    socket.on('disconnect', () => {
      onlineUsers.forEach((user, index) => {
        console.log(user[0]);
        if (user[0] === name && user[1] === id) {
          console.log('passei');
          onlineUsers.splice(index, 1);
        }
      });
      if (onlineUsers.indexOf([name, id]) > -1) {
        onlineUsers.splice(onlineUsers.indexOf([name, id]), 1);
      }
      io.emit('updateOnlineUsers', onlineUsers);
      console.log('depois', onlineUsers);
    });
    socket.on('nameChange', ({ input, nickname }) => {
      onlineUsers.forEach((user, index) => {
        console.log(user[0]);
        console.log(nickname);
        if (user[0] === nickname) {
          onlineUsers[index][0] = input;
          name = input;
        }
      });
      io.emit('updateOnlineUsers', onlineUsers);
      console.log('aqui', onlineUsers);
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
            console.log(user);
            const indexOne = 1;
            const buffer = onlineUsers[index];
            console.log('buffer', buffer);
            idTo = buffer[indexOne];
            console.log(idTo);
          }
        });
        socket.broadcast
          .to(idTo)
          .emit(
            'message',
            formatMessageToFront(formatMessage(nameParam, to)(chatMessage)),
          );
        console.log(to);
      }
    });
  });
};

module.exports = {
  run,
};
