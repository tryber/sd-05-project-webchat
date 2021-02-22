const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const dateFormat = require('dateformat');
const faker = require('faker');

// Escopo retirado do conteúdo 32.3
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Import da model
const { createMessage, getMessages } = require('./models/message');

app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(bodyParser.json());
app.use(cors());

// Lista de usuários
let usersOnline = [];

// Endpoint para leitura das mensagens
app.get('/', async (req, res) => {
  const allMessages = await getMessages();
  res.status(200).render('index', { allMessages, usersOnline });
});

// Endpoint para envio de mensagens
io.on('connection', (socket) => {
  console.log(`Socket conectado: ${socket.id}`);
  const userId = socket.id;
  const fakeName = faker.name.firstName();
  // const fakeName = `Nick_${parseInt(Math.random() * 10000, 10)}`;

  socket.emit('conectado', userId, fakeName);
  usersOnline.push({ socketId: userId, nickname: fakeName });
  socket.broadcast.emit('userOn', userId, fakeName);

  socket.on('message', async ({ nickname, chatMessage }) => {
    const dateTime = dateFormat(new Date(), 'dd-mm-yyyy hh:MM:ss TT');
    await createMessage(nickname, chatMessage, dateTime);
    const message = `${dateTime} - ${nickname}: ${chatMessage}`;
    io.emit('message', message);
  });

  socket.on('nickChange', (nickname) => {
    usersOnline = usersOnline.filter((user) => user.socketId !== userId);
    usersOnline.push({ socketId: userId, nickname });
    io.emit('nickChange', nickname, userId);
  });

  socket.on('disconnect', () => {
    usersOnline = usersOnline.filter((user) => user.socketId !== userId);
    io.emit('disconected', userId);
  });
});

http.listen(3000, () => {
  console.log('Servidor ouvindo na porta 3000');
});
