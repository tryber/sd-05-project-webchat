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
  const messages = await allMessages({ pvtMsg: { $ne: true } });
  return res.status(200).render('index', { onlineUsers, messages });
});

io.on('connection', (socket) => {
  const userId = socket.id;
  const tempNick = uniqueNamesGenerator({
    dictionaries: [colors, animals],
    style: 'capital',
    separator: '',
  });

  onlineUsers.unshift({ userId, nickname: tempNick });
  socket.emit('connected', { userId, nickname: tempNick });
  io.emit('userConnected', userId, tempNick);
  console.log(
    `Usuário ID ${userId} com o nick provisório ${tempNick} entrou no chat!`,
  );

  socket.on('message', async (message) => {
    console.log(message.userId, message.targetId, message.pvtMsg);
    const date = moment(new Date().getTime()).format('DD-MM-YYYY hh:mm:ss A');
    await addMessage({ ...message, date });
    const allSockets = await io.allSockets();
    console.log('>>>: ', allSockets);
    console.log(message);
    if (message.pvtMsg) {
      console.log(`Usuário ${message.userId} pvteou ${message.targetId}`);
      io.to(message.targetId)
        .to(message.userId)
        .emit('message', `${date} - ${message.nickname}(private): ${message.chatMessage}`);
    } else {
      io.emit('message', `${date} - ${message.nickname}: ${message.chatMessage}`);
    }
  });

  socket.on('nickChange', (usuario) => {
    const nick = usuario.nickname;
    const userPosition = onlineUsers.findIndex(
      (usr) => usr.userId === usuario.userId,
    );
    console.log(
      `Usuário ${onlineUsers[userPosition].userId} mudou o nickname de ${onlineUsers[userPosition].nickname} para ${nick}.`,
    );
    onlineUsers[userPosition].nickname = nick;
    io.emit('nickChange', nick, usuario.userId);
  });

  socket.on('disconnect', () => {
    console.log(`Usuário ${userId} vazou!`);
    const userIdx = onlineUsers.findIndex((usr) => usr.userId === userId);
    onlineUsers.splice(userIdx, 1);
    io.emit('userQuit', userId);
  });

  socket.on('getPublic', async () => {
    const msgs = await allMessages({ pvtMsg: null });
    socket.emit('publicHistory', msgs);
  });

  socket.on('getPrivate', async (usrId, targetId) => {
    let msgs = await allMessages();
    if (usrId && targetId) {
      msgs = await allMessages({
        $or: [
          { userId: usrId, targetId },
          { userId: targetId, targetId: usrId },
        ],
      });
      socket.emit('privateHistory', msgs);
    }
    if (usrId && !targetId) {
      msgs = await allMessages({
        $and: [
          { pvtMsg: true },
          {
            $or: [
              {
                targetId: `${userId}`,
              },
              {
                userId: `${userId}`,
              },
            ],
          },
        ],
      });
    }
    socket.emit('privateHistory', msgs);
  });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log(`Ouvindo na porta ${PORT} bb.`);
});
