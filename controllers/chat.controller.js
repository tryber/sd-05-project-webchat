const moment = require('moment');
const socketIo = require('socket.io');
const { randomNameGenerator } = require('../utils/helpers.util');

const now = moment(new Date()).format('DD-MM-yyyy h:mm:ss A');

const formatMessage = (name, message) => (
  `${now} - ${name}: ${message}`
);

module.exports = (server) => async (connection, users) => {
  const messageCollection = await connection('messages');
  const io = socketIo(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', async (socket) => {
    console.log('Novo usuário conectado');
    users[socket.id] = randomNameGenerator();

    // listen new players
    // io.emit('message', formatMessage(users[socket.id], 'acabou de entrar!'));
    io.emit('online_users', users);

    socket.on('message', async ({ chatMessage, nickname = null }) => {
      const sentMessage = {
        at: now,
        nickname: nickname || users[socket.id],
        chatMessage,
      };
      try {
        await messageCollection.insertOne(sentMessage);
        io.emit('message', formatMessage(sentMessage.nickname, sentMessage.chatMessage));
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('change_nickname', (nickname) => {
      users[socket.id] = nickname;
      io.emit('online_users', users);
    });

    socket.on('disconnect', () => {
      console.log(`${users[socket.id]} desconectou!`);
      delete users[socket.id];
      socket.disconnect(0);
      io.emit('online_users', users);
    });
  });
};
