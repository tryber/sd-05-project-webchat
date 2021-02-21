const express = require('express');

const PORT = 3000;
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const cors = require('cors');
const path = require('path');
const moment = require('moment');
const { newMessage, getAllMessages } = require('./model/Message');

app.use(cors());

app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/', express.static(path.join(__dirname, './views')));

let usersOnline = [];

app.get('/', async (_req, res) => {
  const messages = await getAllMessages();
  const formatMessage = messages.map((message) => `${message.time} - ${message.nickname}: ${message.chatMessage}`);
  res.render('index', { formatMessage, usersOnline });
});

const dateFormat = 'DD-MM-yyyy HH:mm:ss';

io.on('connection', (socket) => {
  const nickName = `random User ${Math.ceil(Math.random() * 1000)}`;
  const userId = socket.id;
  socket.emit('user', nickName, userId);
  usersOnline.push({ nickName, userId });
  io.emit('connection', nickName, userId);
  socket.on('message', async ({ chatMessage, nickname }) => {
    const time = moment(Date.now()).format(dateFormat);
    const messageFormat = `${time} - ${nickname}: ${chatMessage}`;
    await newMessage({ chatMessage, time, nickname });
    io.emit('message', messageFormat);
  });

  socket.on('changeNick', (nick, id) => {
    usersOnline = usersOnline.filter((user) => user.userId !== id);
    usersOnline.push({ nickName: nick, userId: id });
    socket.broadcast.emit('changeNick', { nick, id });
  });
  socket.on('disconnect', () => {
    usersOnline = usersOnline.filter((user) => user.userId !== userId);
    io.emit('userDisconnected', userId);
  });
});

server.listen(PORT, () => {
  console.log(`app ouvindo na porta ${PORT}`);
});
