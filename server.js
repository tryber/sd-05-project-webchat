const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');
const path = require('path');
const socketIo = require('socket.io');
const http = require('http');

const app = express();
const httpServer = http.createServer(app);
const io = socketIo(httpServer);
const PORT = 3000;

const { createMessage, getAllMessages } = require('./models/messageModel');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', './views');

let usersOnline = [];

app.get('/', async (req, res) => {
  const messages = await getAllMessages();

  res.render(path.join(__dirname, './views/index.ejs'), { messages, usersOnline });
});

io.on('connection', (socket) => {
  const socketId = socket.id;
  const userNickname = `Guest${Math.round(Math.random() * 1000)}`;
  console.log('A user connected.');

  socket.on('updateNickname', (newNickname) => {
    usersOnline = usersOnline.map((user) => {
      if (user.socketId === socketId) {
        const newUser = user;
        newUser.nickname = newNickname;
        return newUser;
      }

      return user;
    });

    io.emit('updateNickname', newNickname, socketId);
    /* io.emit('usersList', newNickname, socketId); */
  });

  usersOnline.push({ nickname: userNickname, socketId: socket.id });
  socket.emit('saveCurrentId', socket.id);
  io.emit('usersList', userNickname, socketId);

  socket.on('message', async ({ nickname, chatMessage }) => {
    const timestamp = moment(new Date()).format('DD-MM-yyyy hh:mm:ss A');
    const message = `${timestamp} - ${nickname}: ${chatMessage}`;
    await createMessage({ nickname, chatMessage, timestamp });
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected.');
    usersOnline = usersOnline.filter((user) => user.socketId !== socketId);
    io.emit('userDisconnected', socketId);
  });
});

httpServer.listen(PORT, () => console.log(`Rodando na porta ${PORT}...`));
