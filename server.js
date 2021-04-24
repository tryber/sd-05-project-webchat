const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

app.use(cors());
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static(`${__dirname}/public/`));

const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const messageModel = require('./models/messageModel');

const onlineUsers = [];

app.get('/', async (_req, res) => {
  const messageHistory = await messageModel.getMessagesHistory();
  return res.render('index', { messageHistory, onlineUsers });
});

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);
  const username = `Usuário ${Math.trunc(Math.random() * 100)}`;
  onlineUsers.push({ id: socket.id, nickname: username });
  socket.emit('connected', socket.id, username);
  io.emit('connection', socket.id, username);

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`);
    // onlineUsers = onlineUsers.filter((user) => user.id !== socket.id);
    const index = onlineUsers.findIndex((user) => user.id === socket.id);
    onlineUsers.splice(index, 1);
    io.emit('user disconnected', socket.id);
  });

  socket.on('message', async (message) => {
    const { ops } = await messageModel.createMessage(message.nickname, message.chatMessage);
    const [messageInDb] = ops;
    const text = `${messageInDb.time} - ${messageInDb.nickname}: ${messageInDb.chatMessage}`;
    io.emit('message', text);
  });

  socket.on('user changed nickname', (nickname, userId) => {
    const index = onlineUsers.findIndex((user) => user.id === userId);
    onlineUsers[index] = { id: userId, nickname };
    // onlineUsers = onlineUsers.filter((user) => user.id !== userId);
    // onlineUsers.push({ id: userId, nickname });
    socket.broadcast.emit('user changed nickname', { id: userId, nickname });
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
