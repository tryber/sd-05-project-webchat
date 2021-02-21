// dependências
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// eslint-disable-next-line import/no-extraneous-dependencies
const dateFormat = require('dateformat');
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

  res.status(200).render('index', { onlineUsers, messages });
});

io.on('connection', async (socket) => {
  const userId = socket.id;
  const guestNickname = `Guest_${parseInt(Math.random() * 10000, 10)}`;

  console.log(`Usuário com o ID ${userId} conectado!`);
  onlineUsers.unshift({ socketId: userId, nickname: guestNickname });
  // método unshift() faz um "push" num array, porém,
  // adiciona o novo item como primeiro da lista (índice 0)
  io.emit('connected', { userId, guestNickname });

  // evento que emite mensagens
  socket.on('message', async ({ nickname, chatMessage }) => {
    // formatação de data e hora conforme o readme utilizando a biblioteca date-format
    const dateTime = dateFormat(new Date(), 'dd-mm-yyyy hh:MM:ss TT');
    // função assíncrona que adiciona a mensagem
    await addMessage({ nickname, chatMessage, dateTime });
    // monta a mensagem para ser emitida e exibida
    const message = `${dateTime} - ${nickname}: ${chatMessage}`;
    io.emit('message', message);
  });

  // evento que altera o nickname do usuário
  socket.on('updateNickname', (nickname) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== userId);
    onlineUsers.push({ socketId: userId, nickname });
    io.emit('updateNickname', { nickname, socketId: userId });
  });

  // evento que exibe as mensagens antigas (log)
  socket.on('getMessagesLog', async () => {
    const allMessages = await getAllMessages();
    socket.emit('messagesLog', allMessages);
  });

  socket.on('disconnect', () => {
    console.log(`Usuário com o ID ${userId} desconectado!`);
    onlineUsers = onlineUsers.filter((user) => user.socketId !== userId);
    io.emit('userDisconnected', userId);
  });
});

// ouvindo na porta 3000
server.listen(PORT, () => console.log(`Bate-papo rolando na porta ${PORT}`));

/* referências:
1. documentação Moment.js
https://momentjs.com/docs/#/displaying/format/
*/
