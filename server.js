// [Honestidade Acadêmica]
// squad war programming Paulo Zambelli(Helper), eu(Samuel), Larissa e Sid
const express = require('express');
const bodyParser = require('body-parser');
// Cross-Origin Resource Sharing
const cors = require('cors');
const path = require('path');
// moment = date library for parsing, validating, manipulating, and formatting dates.
const moment = require('moment');

const app = express();

// require socket.io e protocolo http
const socketIo = require('socket.io');
const http = require('http');
// const { update } = require('lodash');

// Wss para protocolo http
const server = http.createServer(app);
// socket.io para wss
const io = socketIo(server, {
  cors: {
    // url aceita pelo
    // https://socket.io/docs/v3/handling-cors/
    origin: 'http://localhost:3000',
    // Métodos aceitos pela url
    methods: ['GET', 'POST'],
  },
});

app.use(bodyParser.json());
// https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  }),
);

// require models mensagens
const { createMessage, getMessages, getPrivateMessages } = require('./models/messagesModel');

// rota app.use do diretorio public
app.use(express.static(path.join(__dirname, 'public')));
// por default view engine é ejs
app.set('view engine', 'ejs');
// diretorio public com views
app.set('views', path.join(__dirname, 'public'));

const onlineUsers = {};

io.on('connection', (socket) => {
  const socketId = socket.id;
  console.log(`Socket conectado: ${socketId}`);
  // io.emit('conectado', `${socketId}`);

  socket.on('newUserConectando', ({ myData: old }) => {
    const myData = old;
    myData.socketId = socket.id;
    onlineUsers[myData.socketId] = myData;
    io.emit('updateUsers', { onlineUsers });
    // console.log(myData, 'AQUI ESTÁ O MYDATA');
  });

  socket.on('disconnect', () => {
    delete onlineUsers[socketId];
    io.emit('updateUsers', { onlineUsers });
    console.log(`${socketId} está desconectado`);
  });

  socket.on('message', ({ chatMessage, nickname, target = '' }) => {
    const data = moment(new Date()).format('DD-MM-yyyy hh:mm:ss');
    // https://socket.io/docs/v3/rooms/
    if (target !== '') {
      const newMessage = `${data} (private) - ${nickname}: ${chatMessage}`;
      createMessage(newMessage, socket.id, target);
      return io.to(target).to(socket.id).emit('message', newMessage);
    }
    const newMessage = `${data} - ${nickname}: ${chatMessage}`;
    createMessage(newMessage);
    return io.emit('message', newMessage);
  });

  socket.on('displayName', ({ myData }) => {
    onlineUsers[myData.socketId] = myData;
    io.emit('updateUsers', { onlineUsers });
    // console.log(onlineUsers);
  });
});
// app.get('/', (_req, res) => {
// const getAllMessages = [{ nome: 'BATE PAPO UOL', sala: 'sala: + 18' }];
// return res.status(200).render('index', { getAllMessages, onlineUsers });

let numbers = 0;
// endpoint all messages, users, number by increment guest
app.get('/', async (_req, res) => {
  const getAllMessages = await getMessages();
  res.status(200).render('index', { getAllMessages, onlineUsers, numbers });
  numbers += 1;
});

// endpoint para as messages private enderaçada by client
app.get('/chat-private/:target/:addresse', async (req, res) => {
  const { target, addresse } = req.params;
  const getAllMessages = await getPrivateMessages(target, addresse);
  res.status(200).json(getAllMessages);
});

// endpoint para as messages chatPublic
app.get('/chat', async (_req, res) => {
  const getAllMessages = await getMessages();
  res.status(200).json(getAllMessages);
});

const PORT = 3000;
server.listen(PORT, () => console.log(`ICQ balançou a tela na porta ${PORT}, saudades!!!.`));

// Referencias para o projeto
// Grande ajudar do aluno Paulo Zambelli em resolução do erro do projeto para evaluator.
// revisão Vinicius Vasconcelos <https://github.com/tryber/sd-04-live-lectures/pull/67/files>
// Chat em tempo real com NodeJS + Socket.io | Diego Fernandes | Rocketseat <https://www.youtube.com/watch?v=-jXfKDYJJvo>
// Realtime Chat With Users & Rooms - Socket.io, Node & Express <https://www.youtube.com/watch?v=jD7FnbI76Hg>
