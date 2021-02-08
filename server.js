const express = require('express');
const moment = require('moment');

const path = require('path');

const PORT = process.env.PORT || 3000;

const app = express();

const serverApp = require('http').createServer(app);
const io = require('socket.io')(serverApp);

const { addMessage, getMessages } = require('./models/messages');

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));

app.set('view engine', 'ejs');

let onlineUsers = [];

app.get('/', async (_, res) => {
  const messages = await getMessages();
  res.status(200).render('index', { onlineUsers, messages });
});

io.on('connection', (socket) => {
  const userId = socket.id;
  const clientNickname = `Guest_${parseInt(Math.random() * 10000, 10)}`;

  console.log(`Usuário ${clientNickname} entrou no chat!`);
  onlineUsers.unshift({ userId, nickname: clientNickname });

  socket.emit('connected', userId, clientNickname);
  io.emit('userConnected', userId, clientNickname);

  socket.on('message', ({ nickname, chatMessage }) => {
    const dateTime = new Date().getTime();
    const date = moment(dateTime).format('DD-MM-yyyy h:mm:ss A');

    addMessage({ nickname, chatMessage, date });
    const msg = `${date} - ${nickname}: ${chatMessage}`;

    io.emit('message', msg);
  });

  socket.on('nickChange', (nick, id) => {
    onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
    onlineUsers.push({ userId: id, nickname: nick });
    io.emit('nickChange', nick, id);
  });

  socket.on('disconnect', () => {
    console.log(`Usuário desconectado! ID: ${userId}`);
    onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
    io.emit('userDisconnected', userId);
  });
});

serverApp.listen(PORT, () => console.log(`Baguncinha rolando na porta ${PORT}`));
