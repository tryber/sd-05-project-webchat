// dependências
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// eslint-disable-next-line import/no-extraneous-dependencies
const moment = require('moment');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');

// ambiente de desenvolvimento
const PORT = process.env.PORT || 3000;
require('dotenv').config();

// importações
const { addMessage, getAllMessages } = require('./models/messages');

// express
const app = express();

app.use(bodyParser.json());

// socket.io & cors
const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'public'));

// variáveis
let onlineUsers = [];

// endpoints
app.get('/', async (req, res) => {
  const messages = await getAllMessages();

  res.render('index', { onlineUsers, messages });
});

io.on('connection', async (socket) => {
  const socketId = socket.id;
  const guestNickname = `Guest_${parseInt(Math.random() * 10000, 10)}`;

  console.log(`Usuário com o ID ${socketId} conectado!`);

  socket.emit('connected', socketId, guestNickname);
  io.emit('userConnected', socketId, guestNickname);

  // evento que emite mensagens
  socket.on('message', async ({ nickname, chatMessage }) => {
    // formatação de data e hora conforme o readme utilizando a biblioteca Moment.js
    const now = new Date().getTime();
    const dateTime = moment(now).format('DD-MM-YYYY h:mm:ss A');
    // função assíncrona que adiciona a mensagem
    await addMessage({ nickname, chatMessage, dateTime });
    // monta a mensagem para ser emitida e exibida
    const message = `${dateTime} - ${nickname}: ${chatMessage}`;
    io.emit('message', message);
  });

  // evento que altera o nickname do usuário
  socket.on('updateNickname', (nickname, id) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
    onlineUsers.push({ socketId: id, nickname });
    io.emit('updateNickname', nickname, id);
  });

  // evento que exibe as mensagens antigas (log)
  socket.on('getMessagesLog', async () => {
    const allMessages = await getAllMessages();
    socket.emit('messagesLog', allMessages);
  });

  socket.on('disconnect', () => {
    console.log(`Usuário com o ID ${socketId} desconectado!`);
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
    io.emit('userDisconnected', socketId);
  });
});

// ouvindo na porta 3000
server.listen(PORT, () => console.log(`Bate-papo rolando na porta ${PORT}`));

/* referências:
1. documentação Moment.js
https://momentjs.com/docs/#/displaying/format/
*/
