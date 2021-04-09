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
  res.render('chat', { allMessages, usersOnline });
});

app.post('/message', (req, res) => {
  const { chatMessage, nickname } = req.body;

  if (!chatMessage || !nickname) {
    return res.status(422).json({ message: 'Missing information' });
  }

  // Evento personalizado que dispara para todos os clients.
  // primeiro parametro, nome do evento, segundo, ação que o client deve fazer/dados enviados.
  // io.emit('message', { chatMessage, nickname });

  res.status(200).json({ message: `${nickname} enviou: ${chatMessage}` });
});

io.on('connection', (socket) => {
  const userId = socket.id;

  // Socket emit um evento de login inicial, com o nickname random gerado no chat.ejs.
  socket.on('userLogin', ({ nickname }) => {
    // Mensagem para o server.
    console.log(`${userId} se conectou`);

    // Ajuste a ordenação da lista é feita no front (chat.ejs).
    usersOnline.push({ userId, nickname });

    io.emit('updateUsersList', { id: userId, usersOnline });
  });

  socket.on('changedNickname', (nickname) => {
    usersOnline = usersOnline.map((u) => {
      if (u.userId === userId) {
        return { ...u, nickname };
      }
      return u;
    });

    io.emit('updateUsersList', { id: userId, usersOnline });
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
    usersOnline = usersOnline.filter((u) => u.userId !== userId);

    // Mensagem para o server.
    console.log(`${userId} desconectou`);

    io.emit('updateUsersList', { id: userId, usersOnline });
  });
});

// Servidor Socket (e express no mesmo servidor)
http.listen(PORT, () => {
  console.log(`Servidores ouvindo na porta ${PORT}`);
});
