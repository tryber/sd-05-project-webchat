const cors = require('cors');
const path = require('path');
const moment = require('moment');
const express = require('express');
const {
  uniqueNamesGenerator,
  colors,
  animals,
} = require('unique-names-generator');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const { addMessage, allMessages } = require('./models/messages.model');

const onlineUsers = [];
const viewPath = path.join(__dirname, 'view');
app.use(cors());

app.use(express.static(viewPath));
app.set('views', viewPath);
app.set('view engine', 'ejs');

app.get('/', async (_, res) => {
  const messages = await allMessages();
  res.status(200).render('index', { onlineUsers, messages });
});

io.on('connection', (socket) => {
  const userId = socket.id;
  const tempNick = uniqueNamesGenerator({
    dictionaries: [colors, animals],
    style: 'capital',
    separator: '',
  });

  console.log(
    `Usuário ID ${userId} com o nick provisório ${tempNick} entrou no chat!`,
  );
  onlineUsers.unshift({ userId, nickname: tempNick });
  socket.emit('connected', userId, tempNick);
  io.emit('userConnected', userId, tempNick);

  socket.on('message', async ({ nickname, chatMessage }) => {
    const date = moment(new Date().getTime()).format('DD-MM-YYYY hh:mm:ss A');
    addMessage({ nickname, chatMessage, date });
    const msg = `${date} - ${nickname}: ${chatMessage}`;
    io.emit('message', msg);
  });

  socket.on('nickChange', (nick, id) => {
    const userPosition = onlineUsers.findIndex((usr) => usr.userId === id);
    console.log(
      `Usuário ${onlineUsers[userPosition].userId} mudou o nickname de ${onlineUsers[userPosition].nickname} para ${nick}.`,
    );
    onlineUsers[userPosition].nickname = nick;
    io.emit('nickChange', nick, id);
  });

  socket.on('disconnect', () => {
    console.log(`Usuário ${userId} vazou!`);
    const userIdx = onlineUsers.findIndex((usr) => usr.userId === userId);
    onlineUsers.splice(userIdx, 1);
    io.emit('userQuit', userId);
  });
});

http.listen(process.env.PORT || 3000);
