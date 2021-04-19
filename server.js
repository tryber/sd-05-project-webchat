const express = require('express');
require('dotenv').config();

const onlineUsers = {};

const PORT = process.env.PORT || 3000;

const app = express();
app.set('views', './Views');
app.set('view engine', 'ejs');

// Funções de helpers

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

const formatMessage = (from, to) => (message) => {
  let fromParam = from;
  let toParam = to;
  if (typeof from !== 'string') {
    fromParam = from.toString();
  }
  if (to) {
    if (typeof to !== 'string') {
      toParam = to.toString();
    }
  }
  return {
    from: fromParam,
    to: toParam,
    message,
    createdAt: transformDate(new Date()),
  };
};

const formatMessageToFront = (message, privateParam) => {
  if (!privateParam) {
    return `${message.createdAt} - ${message.from} : ${message.message}`;
  }
  return `${message.createdAt} (private) - ${message.from} : ${message.message}`;
};

// Connections
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { getMessages, getPrivateMessages } = require('./Models/getMessages');
const mongoConnection = require('./Models/mongoDBModel');

io.on('connection', async (socket) => {
  const { id } = socket;
  let name = parseInt(Math.random() * 100000, 10).toString();
  onlineUsers[id] = { name, id };

  socket.emit('connected', { id, name });
  io.emit('greeting', { name });
  io.emit('newUserConnected', { name, id, onlineUsers });
  console.log(onlineUsers);
  socket.on('disconnect', () => {
    delete onlineUsers[id];
    io.emit('userDisconnected', { name, id });
    io.emit('updateOnlineUsers', { onlineUsers });
  });
  socket.on('nameChange', ({ id: idParam, input }) => {
    onlineUsers[idParam].name = input;
    name = input;
    io.emit('nameChange', { name: input, id: idParam });
    io.emit('updateOnlineUsers', { onlineUsers });
  });
  socket.on('getPublicMessages', async () => {
    const messages = await getMessages();
    const formated = messages.map((message) => formatMessageToFront(message));
    socket.emit('getPublicMessages', { messages: formated });
  });
  socket.on('getPrivateHistory', async ({ nickname, to }) => {
    let nicknameParam = nickname;
    let toParam = to;
    if (typeof nickname !== 'string') {
      nicknameParam = nickname.toString();
    }
    if (typeof to !== 'string') {
      toParam = to.toString();
    }
    const messages = await getPrivateMessages(nicknameParam, toParam);
    const formated = messages.map((message) =>
      formatMessageToFront(message, true));
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
      const arr = Object.values(onlineUsers);
      console.log('aqui1', arr);
      arr.forEach((user) => {
        if (user.name === to) {
          idTo = user.id;
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
          formatMessageToFront(formatMessage(nameParam, to)(chatMessage), true),
        );
    }
  });
});
app.get('/', async (req, res) => {
  const messages = await getMessages();
  return res.render('home', { messages, onlineUsers });
});
// rodando o servidor
server.listen(PORT, () => {
  console.log(`O PAI TÁ ON NA PORTA ${PORT}`);
});
