require('dotenv').config();

const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
const messageModel = require('./models/messageModel');

app.use(cors());
app.use(express.static(path.join(__dirname, 'views')));
app.set('views', './views');
app.set('view engine', 'ejs');
// array para armazenar o id e nome do usuário que conectar
let online = [];

app.get('/', async (req, res) => {
  const getM = await messageModel.getMessages();
  return res.render('index.ejs', { getM, online });
});

io.on('connection', async (socket) => {
  console.log('Conectou');
  const username = `User ${Math.trunc(Math.random() * 100)}`;
  online.push({ id: socket.id, nickname: username });
  socket.emit('connected', socket.id, username);
  io.emit('connection', socket.id, username);

  socket.on('disconnect', () => {
    online = online.filter((user) => user.id !== socket.id);
    io.emit('user disconnected', socket.id);
  });
  socket.on('change name', (nickname, userId) => {
    online = online.filter((user) => user.id !== userId);
    online.push({ id: userId, nickname });
    socket.broadcast.emit('change name', { id: userId, nickname });
  });
  socket.on('message', async (message) => {
    const createMessage = await messageModel.createMessage(message.nickname, message.chatMessage);
    const formatedMessage = `${createMessage.time}- ${createMessage.nickname}: ${createMessage.chatMessage}`;
    io.emit('message', formatedMessage);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Listening server at port:${PORT}`);
});
