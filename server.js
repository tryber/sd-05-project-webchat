const moment = require('moment');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const socketIoServer = require('http').createServer(app);
const io = require('socket.io')(socketIoServer);

const { getAllMessages, createMessage } = require('./model/chatModel');

const port = process.env.PORT || 3000;
let onlineUsers = [];

io.on('connect', (socket) => {
  onlineUsers.unshift({ nickname: 'Anonimo', id: socket.id });
  io.emit('user', { nickname: 'Anonimo', id: socket.id });
  socket.on('message', async (message) => {
    const dateNow = new Date().getTime();
    const data = moment(dateNow).format('DD-MM-yyyy h:mm:ss A');
    createMessage({ ...message, data });
    io.emit('message', `${data} - ${message.nickname}: ${message.chatMessage}`);
  });
  socket.on('user', (nickname) => {
    io.emit('user', { nickname, id: socket.id });
  });
  socket.on('disconnect', async () => {
    onlineUsers = await onlineUsers.filter((item) => item.id !== socket.id);
    io.emit('userDis', socket.id);
  });
  socket.on('userChange', (nickname) => {
    onlineUsers.forEach((item) => {
      if (item.id === socket.id) {
        const user = item;
        user.nickname = nickname;
      }
    });
    io.emit('userChange', { nickname, id: socket.id });
  });
});

app.set('view engine', 'ejs');
app.set('views', './view');
app.use(bodyParser.json());
app.use(cors());

app.get('/', async (_req, res) => {
  const allMessages = await getAllMessages();
  res.status(200).render('chat', { onlineUsers, allMessages });
});

socketIoServer.listen(port, () => {
  console.log('estamos quase online ...');
});
