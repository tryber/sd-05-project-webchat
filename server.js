require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const cors = require('cors');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));
// app.set('views', path.join(__dirname, 'public'));
app.set('views', './public');

app.set('view engine', 'ejs');

const messagesModels = require('./models/messagesModel');

let onlineUsers = [];

app.get('/', async (req, res) => {
  const history = await messagesModels.messagesHistory();
  return res.render('index.ejs', { history, onlineUsers });
});

io.on('connection', async (socket) => {
  console.log(`Socket ${socket.id} conectado`);
  const username = `User ${Math.trunc(Math.random() * 100)}`;
  onlineUsers.push({ id: socket.id, nickname: username });
  socket.emit('connected', socket.id, username);
  io.emit('connection', socket.id, username);

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} desconectado`);
    onlineUsers = onlineUsers.filter((user) => user.id !== socket.id);
    socket.broadcast.emit('user disconnected', socket.id);
  });

  socket.on('message', async (message) => {
    console.log(message);
    const stored = await messagesModels.newMessage(message.nickname, message.chatMessage);
    const text = `${stored.time} - ${stored.nickname}: ${stored.chatMessage}`;
    console.log(text);
    io.emit('message', text);
  });

  socket.on('user changed nickname', (nickname, userId) => {
    onlineUsers = onlineUsers.filter((user) => user.id !== userId);
    onlineUsers.push({ id: userId, nickname });
    socket.broadcast.emit('user changed nickname', { id: userId, nickname });
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`O pai ta na porta ${port}`);
});
