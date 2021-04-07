require('dotenv').config();
const cors = require('cors');
const http = require('http');
const path = require('path');
const moment = require('moment');
const express = require('express');
const socketIo = require('socket.io');
const model = require('./model');

const app = express();
const server = http.createServer(app);
const PORT = process.env.SERVER_PORT || 3000;
const io = socketIo(server, {
  cors: {
    origin: `http://localhost:${process.env.SERVER_PORT}`,
    methods: ['GET', 'POST'],
  },
});
app.use(
  cors({
    origin: `http://localhost:${process.env.SERVER_PORT}`,
    methods: ['GET', 'POST'],
  }),
);
app.use(express.json());

app.use('/', express.static(path.join(__dirname, 'view')));
app.set('views', './view');
// engine
app.set('view engine', 'ejs');

// io
const onlineUsers = {};

io.on('connection', (socket) => {
  // on connect
  socket.on('connected', (nickname) => {
    onlineUsers[socket.id] = { nickname, id: socket.id };
    io.emit('users', onlineUsers);
  });
  socket.on('disconnect', () => {
    delete onlineUsers[socket.id];
    // console.log('d', onlineUsers);
  });
  socket.on('message', async (message) => {
    const { nickname, chatMessage } = message;
    const newMessage = await model
      .createMessage({
        date: moment(new Date()).format('DD-MM-yyyy HH:mm:ss'),
        nickname: nickname || socket.id,
        chatMessage,
      })
      .then((msg) => `${msg.date} - ${msg.nickname}: ${msg.chatMessage}`);

    io.emit('message', newMessage);
  });
  socket.on('updateUser', (nickname) => {
    onlineUsers[socket.id].nickname = nickname;
    io.emit('users', onlineUsers);
  });
});
let convidado = 0;
app.get('/', async (_req, res) => {
  const AllMessages = await model.getAllMessages();
  res.status(200).render('view', { messages: AllMessages, onlineUsers, nick: `user ${convidado}` });
  convidado += 1;
});

server.listen(PORT, () => console.log(`listening @${PORT}`));
