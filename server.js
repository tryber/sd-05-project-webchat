require('dotenv').config();
const bodyParser = require('body-parser');
const path = require('path');
const express = require('express');
const moment = require('moment');

// Conteúdo dia 32.3 - https://app.betrybe.com/course/back-end/nodejs/socketio/conteudo/show-me-the-code?use_case=side_bar
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const { createMessage, getAllMessages } = require('./models/chatModel');

const PORT = process.env.PORT || 3000;

let usersOnline = [];

app.use(bodyParser.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'views')));

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', async (_req, res) => {
  const allMessages = await getAllMessages();
  res.render('chat', { allMessages, onlineUsers: usersOnline });
});

app.post('/message', (req, res) => {
  const { chatMessage, nickname } = req.body;

  if (!chatMessage || !nickname) {
    return res.status(422).json({ message: 'Missing information' });
  }

  // Evento personalizado que dispara para todos os clients.
  // primeiro parametro, nome do evento, segundo, ação que o client deve fazer/dados enviados.
  io.emit('message', { chatMessage, nickname });

  res.status(200).json({ message: `${nickname} enviou: ${chatMessage}` });
});

io.on('connection', (socket) => {
  const userId = socket.id;
  usersOnline.unshift({ userId, nickname: userId });

  console.log(`${userId} conectou`);

  socket.emit('connected', userId);
  io.emit('userConnected', userId);

  socket.on('changedNickname', (nickname) => {
    console.log(nickname, 'nickname');
    usersOnline = usersOnline.map((u) => {
      if (u.userId === userId) {
        return { ...u, nickname };
      }
      return u;
    });
    console.log('usersOnline', usersOnline);
    io.emit('changedNickname', ({ userId, nickname }));
  });

  socket.on('message', async ({ chatMessage, nickname }) => {
    const formatedDate = moment(new Date().getTime()).format('DD-MM-yyyy HH:mm:ss');
    await createMessage({
      dateFormat: formatedDate,
      nickname,
      chatMessage,
    });

    io.emit('message', `${formatedDate} - ${nickname}:  ${chatMessage}`);
  });

  socket.on('disconnect', () => {
    usersOnline = usersOnline.filter((u) => u.userId !== socket.id);
    console.log(`${socket.id} desconectou`);
    io.emit('disconnectedUser', socket.id);
  });
});

// Servidor Socket (e express no mesmo servidor)
http.listen(PORT, () => {
  console.log(`Servidores ouvindo na porta ${PORT}`);
});
